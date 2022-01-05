const task = require("hardhat/config").task
require("@nomiclabs/hardhat-ethers")
const getEntry = require("./_env.js").getEntry;

task("buy", "Buy via contract")
  .addParam("amount", "Amount")
  .addParam("token", "Token")
  .setAction(async (args, { ethers }) => {

    const [owner] = await ethers.getSigners();

    const triton = await ethers.getContractAt("Triton", getEntry('TRITON'))

    const buyPath = ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", args.token]

    const tx = await triton.connect(owner).buy(ethers.utils.parseEther(args.amount), buyPath)

    console.log(`Buying ${args.amount} of ${args.token}, txn ${tx.hash}`)

  })
