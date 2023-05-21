import { HardhatUserConfig, subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"

console.log(process.env.ACCOUNT_PRIVATE_KEY)

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  etherscan: {
    apiKey: process.env.ETHERSCAN_NETWORK === "mumabi" ? process.env.POLYGONSCAN_API_KEY : process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      chainId: 5,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY as string],
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      chainId: 80001,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY as string],
    }
  },
};

const lazyImport = async (module: any) => {
  return await import(module);
};

task("deploy", "Deploys contracts").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy");
  await main();
  // await hre.run('print', { message: "Done!" })
});

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });

task("deploy-with-pk", "Deploys contract with pk")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const { main } = await lazyImport("./scripts/deploy-pk");
    await main(privateKey);
  });

task("deploy-and-verify", "Deploys BookLibrary contract to Goerli and verifies it")
  // .addParam("network", "Please provide the private key")
  .setAction(async () => {
    console.log("network name etherscna api key", hre.network.name, hre.config.etherscan.apiKey)
    const { main } = await lazyImport("./scripts/deploy-and-verify")
    await main()
  })

export default config;
