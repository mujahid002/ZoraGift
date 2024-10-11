require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.27",
  networks: {
    zoraSepolia: {
      url: "https://sepolia.rpc.zora.energy",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 999999999,
      timeout: 10000,
      confirmations: 2,
    },
  },
  etherscan: {
    apiKey: {
      zoraSepolia: "mujahid002",
    },
    customChains: [
      {
        network: "zoraSepolia",
        chainId: 999999999,
        urls: {
          apiURL: "https://sepolia.explorer.zora.energy/api",
          browserURL: "https://sepolia.explorer.zora.energy",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
};