// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error NFTmarketPlace__PriceMustBeAboveZero();
error NFTmarketPlace__NotApprovedForMarketPlace();
error NFTmarketPlace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTmarketPlace__NotOwner();
error NFTmarketPlace__NotListed(address nftAddress, uint256 tokenId);
error NFTmarketPlace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTmarketPlace__transferFailed();
error NFTmarketPlace__NoProceeds();

contract NFTmarketPlace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    event itemList(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanclled(
        address indexed sender,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event withdraw(address seller, uint256 amount);
    //Nft contract address => nft TokenId -> listing
    mapping(address => mapping(uint256 => Listing)) private s_listing;
    //seller address => to amount earned // amount people have earned selling nft
    mapping(address => uint256) private s_proceeds;

    ///Modifier////////
    //////////////////////

    modifier NotListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listing[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NFTmarketPlace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NFTmarketPlace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listing[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NFTmarketPlace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    // uint public unlockTime;
    ///main fuctions////////////
    ///////////////////////////

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        //challange : /**have this contract accept payment in a subSet of tokens as well */
        //hint: use chainlink price feed to convert the price of the token between each other
        NotListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NFTmarketPlace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTmarketPlace__NotApprovedForMarketPlace();
        }

        s_listing[nftAddress][tokenId] = Listing(price, msg.sender);
        emit itemList(msg.sender, nftAddress, tokenId, price);
    }

    function BuyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) {
        Listing memory listing = s_listing[nftAddress][tokenId];
        if (msg.value < listing.price) {
            revert NFTmarketPlace__PriceNotMet(
                nftAddress,
                tokenId,
                listing.price
            );
        }
        //sending the money to user
        // Have them withdraw thier money
        //seller address => to amount earned // amount people have earned selling nft

        s_proceeds[listing.seller] = s_proceeds[listing.seller] + msg.value;
        delete (s_listing[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );
        //check to make sure nft was transfer
        emit ItemBought(msg.sender, nftAddress, tokenId, listing.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listing[nftAddress][tokenId]);
        emit ItemCanclled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_listing[nftAddress][tokenId].price = newPrice;
        emit itemList(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 procceds = s_proceeds[msg.sender];
        if (procceds <= 0) {
            revert NFTmarketPlace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: procceds}("");
        if (!success) {
            revert NFTmarketPlace__transferFailed();
        }
        emit withdraw(msg.sender, procceds);
    }

    /////getter functions
    ///////////////////////

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listing[nftAddress][tokenId];
    }

    function getProcceds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
    // get
}
//  1. listItem
//    2. buy item
//    3. cancleItem
//    4. updateListing
//    5. withdrawProceeds
