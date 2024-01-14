const { ethers } = require("hardhat");
const price = ethers.parseEther("0.001");

async function main() {
  const deployer = await ethers.getSigners();
  const nftMarketPlace = await ethers.getContract(
    "NFTmarketPlace",
    deployer[0]
  );
  const basicNft = await ethers.getContract("BasicNFT", deployer[0]);
  console.log("minting nft pls wait...");
  const mintNft = await basicNft.mintNft();
  const tx = await mintNft.wait(1);
  console.log("approving nft pls wait...");
  const approve = await basicNft.approve(await nftMarketPlace.getAddress(), 0);
  await approve.wait(1);
  console.log("listing nft pls wait");
  await nftMarketPlace.listItem(await basicNft.getAddress(), 0, price);
  console.log("listed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
