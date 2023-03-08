//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IWBNB.sol";
import "./Library.sol";

import "hardhat/console.sol";

contract Triton {
    address private immutable OWNER;
    IWBNB private immutable WBNB;
    address private immutable factory;

    constructor(address WBNBAddress, address _factory) {
        OWNER = msg.sender;
        WBNB = IWBNB(WBNBAddress);
        factory = _factory;
    }

    modifier onlyOwner() {
        require(msg.sender == OWNER, "ERROR 403");
        _;
    }

    receive() external payable {
        // only accept BNB from unwrapping via the WBNB contract
        require(msg.sender == address(WBNB), "Can't deposit directly");
    }

    function deposit() external payable {
        WBNB.deposit{value: msg.value}();
    }

    function withdraw(uint256 amount) external onlyOwner {
        // Unwrap and send
        require(
            amount <= WBNB.balanceOf(address(this)),
            "Withdrawing too much"
        );
        WBNB.withdraw(amount);
        payable(msg.sender).transfer(amount);
    }

    function swap(uint256 amountIn, address[] memory path)
        private
        returns (uint256 amountOut)
    {
        amountOut = Library.getAmountOut(factory, amountIn, path);
        require(amountOut >= 0, "Triton: INSUFFICIENT_OUTPUT_AMOUNT");
        assert(
            IERC20(path[0]).transfer(
                Library.pairFor(factory, path[0], path[1]),
                amountIn
            )
        );

        (address input, address output) = (path[0], path[1]);
        (address token0, ) = Library.sortTokens(input, output);
        (uint256 amount0Out, uint256 amount1Out) = input == token0
            ? (uint256(0), amountOut)
            : (amountOut, uint256(0));
        IPair(Library.pairFor(factory, input, output)).swap(
            amount0Out,
            amount1Out,
            address(this),
            new bytes(0)
        );
    }

    function buy(uint256 amount, address tokenAddress) public onlyOwner {
        address[] memory path = new address[](2);
        path[0] = address(WBNB);
        path[1] = tokenAddress;

        // Test buy-sell small amount
        uint256 bnbBalance = WBNB.balanceOf(address(this));
        uint256 amountOut = swap(1e10, path);

        console.log(amountOut);
        console.log(IERC20(tokenAddress).balanceOf(address(this)));
        require(
            amountOut == IERC20(tokenAddress).balanceOf(address(this)),
            "TOXIC"
        );

        address[] memory revPath = new address[](2);
        revPath[0] = tokenAddress;
        revPath[1] = address(WBNB);
        swap(amountOut, revPath);

        require(
            bnbBalance - WBNB.balanceOf(address(this)) < 5e8,
            "Lost too much"
        );

        // Should be safe from front-running, right?
        swap(amount, path);
    }

    function sell(uint256 amount, address tokenAddress) public onlyOwner {
        address[] memory sellPath = new address[](2);
        sellPath[0] = tokenAddress;
        sellPath[1] = address(WBNB);
        swap(amount, sellPath);
    }
}
