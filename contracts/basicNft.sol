// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.7;

contract BasicNFT is ERC721 {
    uint256 private s_tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Doggy", "DOG") {
        s_tokenCounter = 0;
    }

    event nftMinted(uint256 indexed tokenId, address indexed minter);

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;

        return s_tokenCounter;
    }

    function tokenURI(
        uint256 /* tokenId*/
    ) public view override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    //view and pure function

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getTokenURL() public pure returns (string memory) {
        return TOKEN_URI;
    }
}
