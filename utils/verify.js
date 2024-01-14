require("dotenv").config();
const { network, run } = require("hardhat");

const verify = async function (contractAddress, arg) {
  const chainId = network.config.chainId;
  if (chainId !== 31337 && process.env.ETHERSCAN_APIKEY) {
    console.log("verfiying contrsct pls wait... ");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: arg,
      });
    } catch (error) {
      if (error.message.toLowerCase().includes("verified contract")) {
        console.log("Contract Already verifled");
      } else {
        console.log(error);
      }
    }
  }
};

module.exports = { verify };
