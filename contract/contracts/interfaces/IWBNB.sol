// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.6.12;

interface IWBNB {

    function balanceOf(address addr) external returns (uint256);

    function deposit() external payable;

    function transfer(address to, uint256 value) external returns (bool);

    function withdraw(uint256) external;

    function approve(address spender, uint256 value) external returns (bool);
}
