const main = require('./_deploy').main;

const WBNBAddress = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';
const RouterAddress = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';

main(WBNBAddress, RouterAddress)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })