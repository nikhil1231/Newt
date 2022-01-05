const task = require("hardhat/config").task
require("@nomiclabs/hardhat-ethers")
const getEntry = require("./_env.js").getEntry;

task("sell", "Sell via contract")
  .addParam("token", "Token")
  .setAction(async (args, { ethers }) => {

    const [owner] = await ethers.getSigners();

    const triton = await ethers.getContractAt("Triton", getEntry('TRITON'))

    const sellPath = [args.token, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"]

    const token = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", args.token)
    const balance = await token.balanceOf(triton.address)
    const tx = await triton.connect(owner).sell(balance, sellPath)

    console.log(`Selling ${args.token}, txn ${tx.hash}`)

  })
