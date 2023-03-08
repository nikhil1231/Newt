const task = require("hardhat/config").task
require("@nomiclabs/hardhat-ethers")
const getEntry = require("./_env.js").getEntry;

task("tmptest", "TESTING")
  .setAction(async (args, { ethers }) => {

    const [owner] = await ethers.getSigners();

    const WBNBAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const factory = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

    const Triton = await ethers.getContractFactory("Triton");
    const triton = await Triton.deploy(WBNBAddress, factory)
    await triton.deployed()

    await triton.connect(owner).deposit({
      value: ethers.utils.parseEther("1"),
    })

    // BUSD - 0xe9e7cea3dedca5984780bafc599bd69add087d56
    //  - 0xfcedd1291086cad50f15606c7674923eaafb2395
    const tokenAddress = "0x3933d585d7c41ee55fe93342f8d9e27632f1d169"

    await triton.connect(owner).buy(ethers.utils.parseEther("0.1"), tokenAddress, {
      gasPrice: 5e9,
      gasLimit: 5e6
    })

  })
