const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const chainId = network.config.chainId;
chainId != 31337
  ? describe.skip
  : describe("nftMarketPlace", () => {
      let nftMarketPlacce, deployer, account, basicNft, player;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        player = (await getNamedAccounts()).player;
        await deployments.fixture(["all"]);
        nftMarketPlacce = await ethers.getContract("NFTmarketPlace", deployer);
        nftMarketPlacce.waitForDeployment();
        basicNft = await ethers.getContract("BasicNFT", deployer);
        basicNft.waitForDeployment();
        account = await ethers.getSigners();
      });
      describe("listNft", () => {
        // NotListed(nftAddress, tokenId, msg.sender)
        // isOwner(nftAddress, tokenId, msg.sender)
        it("confirms if the owner of nft", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);

          const nftMarketPlaceConnect = nftMarketPlacce.connect(account[1]);
          await expect(
            nftMarketPlaceConnect.listItem(basicNft.target, 0, 2000)
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__NotOwner"
          );
        });
        it("confirms price if above zero", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);

          await expect(
            nftMarketPlacce.listItem(basicNft.target, 0, 0)
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__PriceMustBeAboveZero"
          );
        });
        it("confirms nft approved", async () => {
          await basicNft.mintNft();
          await expect(
            nftMarketPlacce.listItem(basicNft.target, 0, 10000)
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__NotApprovedForMarketPlace"
          );
        });

        it("approve nft and confirms if it emits events", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          const listNft = nftMarketPlacce.listItem(basicNft.target, 0, 20000);
          await expect(listNft).to.emit(nftMarketPlacce, "itemList");
        });

        it("reverts if items is already listed", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 10000);
          await expect(
            nftMarketPlacce.listItem(basicNft.target, 0, 1000)
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__AlreadyListed"
          );
        });
      });

      describe("BuyItem", () => {
        it("confirms if item is listed", async () => {
          await expect(
            nftMarketPlacce.BuyItem(basicNft.target, 0)
          ).to.be.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__NotListed"
          );
        });

        it("confirms if price was meet", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 10);
          await expect(
            nftMarketPlacce.BuyItem(basicNft.target, 0, { value: 1 })
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__PriceNotMet"
          );
        });

        it("emiting of events,", async () => {
          // beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
          // });
          const nftConnectPlayers = await nftMarketPlacce.connect(account[1]);
          const BuyItem = nftConnectPlayers.BuyItem(basicNft.target, 0, {
            value: 2000,
          });
          await expect(BuyItem).to.emit(nftMarketPlacce, "ItemBought");
        });

        it("confirms deleting of listing", async () => {
          // beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
          // });
          const nftConnectPlayer = await nftMarketPlacce.connect(account[1]);
          await nftConnectPlayer.BuyItem(basicNft.target, 0, { value: 2000 });
          const value = await nftMarketPlacce.getListing(basicNft.target, 0);
          assert.equal(value[0], 0);
        });

        it("confirm new nftOwner", async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
          const nftConnectPlayer = await nftMarketPlacce.connect(account[1]);
          await nftConnectPlayer.BuyItem(basicNft.target, 0, { value: 2000 });
          const newOwner = await basicNft.ownerOf(0);
          assert.equal(player, newOwner);
        });
      });

      describe("cancle listing", () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
        });

        it("confirms events", async () => {
          await expect(
            nftMarketPlacce.cancelListing(basicNft.target, 0)
          ).to.emit(nftMarketPlacce, "ItemCanclled");
        });

        it("confirm if listing was delete ", async () => {
          await nftMarketPlacce.cancelListing(basicNft.target, 0);
          const listing = await nftMarketPlacce.getListing(basicNft.target, 0);
          assert.equal(listing[0], 0);
        });
      });

      describe("updateListing", () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
        });

        it("confirms if its emits events", async () => {
          await expect(
            nftMarketPlacce.updateListing(basicNft.target, 0, 100)
          ).to.emit(nftMarketPlacce, "itemList");
        });

        it("confirms if the price was updated on listing", async () => {
          await nftMarketPlacce.updateListing(basicNft.target, 0, 100);
          const getListing = await nftMarketPlacce.getListing(
            basicNft.target,
            0
          );
          // console.log(getListing);
          assert.equal(getListing[0], 100);
        });
      });

      describe("confirms withDrawProceeds", () => {
        beforeEach(async () => {
          await basicNft.mintNft();
          await basicNft.approve(nftMarketPlacce.target, 0);
          await nftMarketPlacce.listItem(basicNft.target, 0, 2000);
        });

        it("confirms proceed expect to revert without buyer", async () => {
          await expect(
            nftMarketPlacce.withdrawProceeds()
          ).to.revertedWithCustomError(
            nftMarketPlacce,
            "NFTmarketPlace__NoProceeds"
          );
        });

        it("confirms if it emit events", async () => {
          await nftMarketPlacce.BuyItem(basicNft.target, 0, { value: 2000 });
          await expect(nftMarketPlacce.withdrawProceeds()).to.emit(
            nftMarketPlacce,
            "withdraw"
          );
        });

        it("confirms if balance of proceeds was reset", async () => {
          await nftMarketPlacce.BuyItem(basicNft.target, 0, { value: 2000 });
          await nftMarketPlacce.withdrawProceeds();
          const balance = await nftMarketPlacce.getProcceds(deployer);
          assert.equal(balance, 0);
        });
      });
    });
