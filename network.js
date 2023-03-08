import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import { readFile } from 'fs/promises';
import { WBNB, ERC20ABI } from './consts.js';

dotenv.config();

const RPC = 'https://bsc-dataseed.binance.org/'

const provider = new ethers.providers.JsonRpcProvider(RPC)
const wallet = new ethers.Wallet(process.env.PK, provider);

const tritonABI = JSON.parse(
  await readFile('./contract/artifacts/contracts/Triton.sol/Triton.json')
).abi

const triton = new ethers.Contract(process.env.TRITON, tritonABI, provider)

export const buyToken = async (tokenAddress, amount) => {
  const path = [WBNB, tokenAddress]

  await triton.connect(wallet).buy(amount, path, {
    gasPrice: 5e9,
    gasLimit: 5e6
  })
}

export const sellToken = async (tokenAddress, amount) => {
  const path = [tokenAddress, WBNB]

  const token = new ethers.Contract(tokenAddress, ERC20ABI, provider)

  const balance = await token.balanceOf(triton.address)

  await triton.connect(wallet).sell(balance, path, {
    gasPrice: 5e9,
    gasLimit: 15e5
  })
}
