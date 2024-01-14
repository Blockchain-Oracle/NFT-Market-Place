require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

const PRIVATEKEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.RPC_URL;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY;
const coinmarketApiKey = process.env.COINMARKET_APIKEY;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.20" }],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // forking: {
      //   url: MAINNET_RPC_URL,
      // },
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      chainId: 11155111,
      accounts: PRIVATEKEY !== "undefined" ? [PRIVATEKEY] : "",
      url: SEPOLIA_RPC_URL !== "undefined" ? SEPOLIA_RPC_URL : "",
    },
  },

  gasReporter: {
    enabled: true,
    // coinmarketcap: coinmarketApiKey !== "undefined" ? coinmarketApiKey : "",
    noColors: true,
    outputFile: "report.txt",
    currency: "USD",
    token: "MATIC",
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY !== "undefined" ? ETHERSCAN_APIKEY : "",
  },
  mocha: {
    timeout: 300000,
  },
};
