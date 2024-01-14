const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { assert, expect } = require("chai");
describe(" BasicNft", () => {
  let deployer, BasicNft;
  beforeEach(async () => {
    await deployments.fixture(["all"]);
    deployer = (await getNamedAccounts()).deployer;
    BasicNft = await ethers.getContract("BasicNFT", deployer);
    await BasicNft.waitForDeployment();
    console.log(BasicNft.target);
  });
  describe("Constructor", () => {
    it("confirms token counter", async () => {
      const counter = await BasicNft.getTokenCounter();
      assert.equal(counter, 0);
    });
  });
  describe("mintFunction", () => {
    it("confirm counter ++", async () => {
      await BasicNft.mintNft();
      expect(await BasicNft.getTokenCounter()).to.be.greaterThan("0");
    });
  });
  describe("confirm TOKEN_URL", () => {
    it("confirm URL_TOKEN", async () => {
      const TOKEN_URI = await BasicNft.tokenURI(0);
      expect(TOKEN_URI).to.include("ipfs://");
    });
  });
});
