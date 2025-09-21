require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local Ganache network
    ganache: {
      url: "http://127.0.0.1:7545", // Default Ganache RPC URL
      accounts: [
        "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
        "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
        "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897"

        // Add your Ganache private keys here for testing
        // These are example private keys - replace with your actual Ganache accounts
    
      ],
      chainId: 1337,
      gas: 6000000,
      gasPrice: 20000000000, // 20 gwei
    },
    
    // Hardhat local network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Development network (for testing)
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  mocha: {
    timeout: 40000
  }
};