const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const PasswordManager = await ethers.getContractFactory("PasswordManager");
  const passwordManager = await PasswordManager.deploy();

  console.log("PasswordManager address:", passwordManager.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
