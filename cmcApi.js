import cheerio from "cheerio";
import fetch from 'node-fetch';

export const getNewCoins = async () => {
  const script = await getScript("https://coinmarketcap.com/new/")
  const coins = script.props.initialProps.pageProps.data.data.recentlyAddedList;

  return coins;
}

export const getCoinInfo = async (coin) => {
  const script = await getScript("https://coinmarketcap.com/currencies/" + coin.slug)
  const info = script.props.initialProps.pageProps.info.platforms[0]

  return info
}

export const getCoinMarket = async (coin) => {
  const res = await fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=${coin.slug}&start=1&limit=100&category=spot&sort=cmc_rank_advanced`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "if-modified-since": "Thu, 30 Dec 2021 14:19:02 GMT",
      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "Referer": "https://coinmarketcap.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const json = await res.json()
  const market = json.data.marketPairs.filter(market =>
    'exchangeSlug' in market &&
    market.exchangeSlug == 'pancakeswap-v2' &&
    market.quoteSymbol == 'WBNB')

  return market.length == 0 ? null : market[0]
}

const getScript = async (url) => {
  const html = await fetch(url).then((res, err) => res.text())
  const $ = cheerio.load(html);
  return JSON.parse($('script[id="__NEXT_DATA__"]').html());
}