// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.12;

import "./SafeMath.sol";
import "./Pair.sol";
import "./IERC20.sol";
import "./Library.sol";
import "./WBNB.sol";

import "hardhat/console.sol";

contract Router {
    using SafeMath for uint256;

    Pair private pair;
    WBNB private wbnb;

    function init(address pairAddress, address WBNBAddress) public {
        pair = Pair(pairAddress);
        wbnb = WBNB(WBNBAddress);
    }

    function setLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external {
        IERC20(tokenA).transferFrom(msg.sender, address(pair), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(pair), amountB);
        pair.mint(msg.sender);
    }

    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address _to
    ) internal virtual {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = Library.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2
                ? address(pair)
                : _to;
            pair.swap(
                amount0Out,
                amount1Out,
                to,
                new bytes(0)
            );
        }
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        virtual
        returns (uint256[] memory amounts)
    {
        address[] memory lps = new address[](1);
        lps[0] = address(pair);

        amounts = Library.getAmountsOut(amountIn, path, lps);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );

        assert(IERC20(path[0]).transferFrom(msg.sender, lps[0], amounts[0]));
        _swap(amounts, path, to);
    }
}
