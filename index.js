import { checkNewCoin } from "./coin.js";
import { buyToken, sellToken } from './network.js';
import { ethers } from "ethers";

const REFRESH_TIMEOUT = 3 * 1000;
// const HOLD_TIME = 30 * 60 * 1000;
const HOLD_TIME = 30 * 1000;

const mainLoop = async () => {
  const coin = await checkNewCoin()

  if (coin == null) return;

  console.log(`Buying ${coin.name}, ${coin.address}`);
  buyToken(coin.address, ethers.utils.parseEther("0.01"))

  // setTimeout(() => sellToken(coin.address, 0), HOLD_TIME)
}

// mainLoop();
// buyToken("0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", ethers.utils.parseEther("0.01"))
// sellToken("0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", 0)

// approve isnt being called for some reason
// npx hardhat tmptest