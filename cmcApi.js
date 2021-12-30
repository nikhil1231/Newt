import cheerio from "cheerio";
import fetch from 'node-fetch';

export const getNewCoins = async () => {

  const html = await fetch("https://coinmarketcap.com/new/").then((res, err) => res.text())
  const $ = cheerio.load(html);
  const script = JSON.parse($('script[id="__NEXT_DATA__"]').html());
  const coins = script.props.initialProps.pageProps.data.data.recentlyAddedList;

  return coins;
}
