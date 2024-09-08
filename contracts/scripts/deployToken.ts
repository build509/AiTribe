// deploy/deploy_token.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Define the initial supply for the token (e.g., 1 million tokens)
  const initialSupply = ethers.utils.parseUnits("100000000", 18);

  // Deploy the MyToken contract with the initial supply
  await deploy("MyToken", {
    from: deployer,
    args: [initialSupply],
    log: true,
  });
};

module.exports.tags = ["Token"];
