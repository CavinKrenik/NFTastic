// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ✅ Correctly import with alias names
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTasticNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    // ✅ Constructor includes required parameters for both parents
    constructor(address initialOwner) ERC721("NFTastic", "NFTC") Ownable(initialOwner) {
        tokenCounter = 0;
    }

    // ✅ Minting function
    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newItemId = tokenCounter;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        tokenCounter += 1;
        return newItemId;
    }
}
