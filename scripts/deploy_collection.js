const hre = require("hardhat");
const {BASE_URL} = require("../config")

async function main() {
  

  const LARCollection = await hre.ethers.getContractFactory("LARCollection");
  const larCollection = await LARCollection.deploy("LAR Collection", "LAR_NFT", BASE_URL);

  await larCollection.deployed();

  console.log("LARCollection deployed to:", larCollection.address);

  console.log(`Deploy contract at npx hardhat verify --network testnet "LAR Collection" "LAR_NFT" ${BASE_URL}`)
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// "npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1""
// "npx hardhat verify --network testnet --constructor-args scripts/args.js 0x3786e694D4c6550b4cb389eA3Abf46e2859152c7"
// npx hardhat run --network testnet scripts/deploy_collection.js