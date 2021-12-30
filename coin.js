import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getNewCoins, getCoinInfo, getCoinMarket } from "./cmcApi.js";

const COIN_PATH = './data/latestCoin.txt';
const COIN_TIMEOUT = 5 * 60 * 1000;

export const checkNewCoin = async () => {
  const coins = await getNewCoins()

  const latestFilteredCoin = filterCoins(coins)[0];

  if (isNewCoin(latestFilteredCoin)) {
    console.log("NEW COIN");

    storeLatestCoin(latestFilteredCoin);

    if (coinTimedOut(latestFilteredCoin)) {
      console.log("Latest coin added too long ago.");
      return null;
    }

    const [market, info] = await Promise.all([getCoinMarket(latestFilteredCoin), getCoinInfo(latestFilteredCoin)])

    if (market == null) {
      console.log("Not on PancakeSwap");
      return null;
    }

    latestFilteredCoin.market = market;
    latestFilteredCoin.address = info.contractAddress;

    return latestFilteredCoin;
  }

  return null;
}

const filterCoins = (coins) => {
  return coins.filter(coin => 'platforms' in coin
    && coin.platforms[0].id == 1839);
}

const isNewCoin = (latestCoin) => {
  return !existsSync(COIN_PATH) || readLatestCoin() != latestCoin.id.toString()
}

const coinTimedOut = (coin) => {
  const coinTime = new Date(coin.addedDate);
  const now = new Date();

  return now.getTime() - coinTime.getTime() > COIN_TIMEOUT
}

const readLatestCoin = () => {
  return readFileSync(COIN_PATH);
}

const storeLatestCoin = (coin) => {
  writeFileSync(COIN_PATH, coin.id.toString())
}