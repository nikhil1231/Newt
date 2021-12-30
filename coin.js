import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getNewCoins } from "./cmcApi.js";

const COIN_PATH = './data/latestCoin.txt';

export const checkNewCoin = async () => {
  const coins = await getNewCoins()

  const latestFilteredCoin = filterCoins(coins)[0];

  if (isNewCoin(latestFilteredCoin)) {
    console.log("NEW COIN");
  }

  storeLatestCoin(latestFilteredCoin);
}

const filterCoins = (coins) => {
  return coins.filter(coin => 'platforms' in coin
    && coin.platforms[0].id == 1839);
}

const isNewCoin = (latestCoin) => {
  return !existsSync(COIN_PATH) || readLatestCoin() != latestCoin.id.toString()
}

const readLatestCoin = () => {
  return readFileSync(COIN_PATH);
}

const storeLatestCoin = (coin) => {
  writeFileSync(COIN_PATH, coin.id.toString())
}