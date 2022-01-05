const main = require('./_deploy').main;

const WAVAXAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const RouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

main(WAVAXAddress, RouterAddress)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })