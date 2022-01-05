//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";
import "./interfaces/IPCR.sol";
import "./interfaces/IWBNB.sol";

// import "hardhat/console.sol";

contract Triton {
    address private immutable OWNER;
    IWBNB private immutable WBNB;
    IPancakeRouter02 private immutable router;

    constructor(address WBNBAddress, address routerAddress) {
        OWNER = msg.sender;
        WBNB = IWBNB(WBNBAddress);
        router = IPancakeRouter02(routerAddress);
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

    function buy(uint256 amount, address[] calldata path) onlyOwner public {
        require(path[0] == address(WBNB), "Can only buy with WBNB");
        WBNB.approve(address(router), 2**256 - 1);
        IERC20 token = IERC20(path[1]);
        token.approve(address(router), 2**256 - 1);

        // Test buy-sell small amount
        uint256 bnbBalance = WBNB.balanceOf(address(this));
        uint256[] memory amounts = router.swapExactTokensForTokens(1e10, 0, path, address(this), block.timestamp + 60);

        address[] memory revPath = new address[](2);
        revPath[0] = path[1];
        revPath[1] = path[0];
        router.swapExactTokensForTokens(amounts[1], 0, revPath, address(this), block.timestamp + 60);

        require(bnbBalance - WBNB.balanceOf(address(this)) < 5e8, "Lost too much");

        // Should be safe from front-running, right?
        router.swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp + 60);
    }

    function sell(uint256 amount, address[] calldata path) onlyOwner public {
        router.swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp + 60);
    }
}
