const ethers = require('hardhat').ethers;
const addToEnv = require("./_env").addToEnv;

exports.main = async (WBNBAddress, RouterAddress) => {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Triton = await ethers.getContractFactory("Triton")
  const triton = await Triton.deploy(WBNBAddress, RouterAddress, {
    gasLimit: 1e7
  })

  await triton.deployed()
  console.log(`Triton deployed to: ${triton.address}`)

  addToEnv("TRITON", triton.address)
}
