const { verify } = require("../utils/verify");

module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const basicNft = await deploy("BasicNFT", {
    from: deployer,
    arg: [],
    log: true,
  });
  log("...........................................................");

  await verify(basicNft.address, []);
};
module.exports.tags = ["BasicNft", "all"];
