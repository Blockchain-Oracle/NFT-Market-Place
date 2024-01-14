const { verify } = require("../utils/verify");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //   console.log(deployer);

  const nftMartetPlace = await deploy("NFTmarketPlace", {
    from: deployer,
    arg: [],
    log: true,
  });
  log(".........................................................");

  await verify(nftMartetPlace.address, []);
};
module.exports.tags = ["NftMarketPlace", "all"];
