const task = require("hardhat/config").task
require("@nomiclabs/hardhat-ethers")
const getEntry = require("./_env.js").getEntry;

task("withdraw", "Withdraw")
  .addParam("amount", "Amount")
  .setAction(async (args, { ethers }) => {
    const [owner] = await ethers.getSigners();

    const triton = await ethers.getContractAt("Triton", getEntry('TRITON'))

    const tx = await triton.connect(owner).withdraw(ethers.utils.parseEther(args.amount))

    console.log(`Withdrawing ${args.amount} to ${owner.address}, txn ${tx.hash}`)
  });
