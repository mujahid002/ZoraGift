// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Custom errors for gas efficiency
error InvalidAddress();
error ZeroValue();
error NotTokenOwner();
error AlreadyRedeemed();
error TransferFailed();

/// @custom:security-contact mujahidshaik2002@gmail.com
contract ZoraGift is
    ERC721,
    ERC721Enumerable,
    ERC721Pausable,
    Ownable,
    ReentrancyGuard
{
    mapping(uint256 => address) private s_tokenIdToSender;
    mapping(uint256 => uint256) private s_tokenIdToAmount;
    uint256 private s_nextTokenId;

    // Events for better tracking
    event GiftSent(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount
    );
    event GiftRedeemed(
        address indexed redeemer,
        uint256 indexed tokenId,
        uint256 amount
    );

    constructor() ERC721("ZoraGift", "ZGC") Ownable(_msgSender()) {}

    // Base URI for token metadata
    function _baseURI() internal pure override returns (string memory) {
        return "https://sample/";
    }

    // Send a gift and mint an NFT to the recipient
    function sendGift(address to) public payable {
        if (to == address(0)) revert InvalidAddress();
        if (msg.value == 0) revert ZeroValue();

        uint256 tokenId = s_nextTokenId++;
        s_tokenIdToSender[tokenId] = msg.sender;
        s_tokenIdToAmount[tokenId] = msg.value;
        _safeMint(to, tokenId);

        emit GiftSent(msg.sender, to, tokenId, msg.value);
    }

    // Redeem the gift associated with an NFT
    function redeemGift(uint256 tokenId) public nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        uint256 amount = s_tokenIdToAmount[tokenId];
        if (amount == 0) revert AlreadyRedeemed();

        // Reset the amount before transferring to prevent reentrancy
        s_tokenIdToAmount[tokenId] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit GiftRedeemed(msg.sender, tokenId, amount);
    }

    // Getter functions
    function getSender(uint256 tokenId) external view returns (address) {
        return s_tokenIdToSender[tokenId];
    }

    function getAmount(uint256 tokenId) external view returns (uint256) {
        return s_tokenIdToAmount[tokenId];
    }

    function getNextTokenId() external view returns (uint256) {
        return s_nextTokenId;
    }

    // Functions to pause and unpause the contract
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        return super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}