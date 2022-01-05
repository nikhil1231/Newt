const task = require("hardhat/config").task
require("@nomiclabs/hardhat-ethers")
const getEntry = require("./_env.js").getEntry;

task("deposit", "Deposit from master to contract")
  .addParam("amount", "Amount")
  .setAction(async (args, { ethers }) => {

    const [owner] = await ethers.getSigners();

    const triton = await ethers.getContractAt("Triton", getEntry('TRITON'))

    const tx = await triton.connect(owner).deposit({
      value: ethers.utils.parseEther(args.amount),
    })

    console.log(`Depositing ${args.amount} to ${getEntry('TRITON')}, txn ${tx.hash}`)

  })
