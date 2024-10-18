// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ZoraGift - A smart contract for sending and managing NFT-based gifts.
/// @notice This contract allows users to send gifts by minting NFTs, contributors to add funds, and owners to redeem the total amount.
/// @custom:security-contact mujahidshaik2002@gmail.com
contract ZoraGift is
    ERC721,
    ERC721Enumerable,
    ERC721Pausable,
    Ownable,
    ReentrancyGuard
{
    // ===========================
    // ======== Errors ==========
    // ===========================

    /// @dev Thrown when an invalid address is provided.
    error ZoraGift__InvalidAddress();

    /// @dev Thrown when a zero value is sent.
    error ZoraGift__ZeroValue();

    /// @dev Thrown when the caller is not the token owner.
    error ZoraGift__NotTokenOwner();

    /// @dev Thrown when attempting to redeem an already redeemed gift.
    error ZoraGift__AlreadyRedeemed();

    /// @dev Thrown when a transfer fails.
    error ZoraGift__TransferFailed();

    /// @dev Thrown when the token does not exist.
    error ZoraGift__TokenDoesNotExist();

    /// @dev Thrown when the gift is not contributable.
    error ZoraGift__NotContributable();

    /// @dev Thrown when the gift is not redeemable.
    error ZoraGift__NotRedeemable();

    /// @dev Thrown when the contribution amount is too low.
    error ZoraGift__ContributionTooLow();

    // ===========================
    // ======= Mappings =========
    // ===========================

    /// @dev Maps a tokenId to its contributors' addresses.
    mapping(uint256 => address[]) private s_tokenIdToContributors;

    /// @dev Maps a tokenId to the amounts contributed by each sender.
    mapping(uint256 => uint256[]) private s_tokenIdToContributions;

    /// @dev Maps a tokenId to its metadata URI.
    mapping(uint256 => string) private s_tokenIdToIpfsHash;

    /// @dev Maps a tokenId to its redemption timestamp.
    mapping(uint256 => uint64) private s_tokenIdToRedemptionTimestamp;
    mapping(uint256 => uint256) private s_tokenIdToTotalAmount;

    /// @dev Tracks the next tokenId to be minted.
    uint256 private s_nextTokenId;

    // ===========================
    // ======== Events ==========
    // ===========================

    /// @dev Emitted when a gift is sent.
    event GiftSent(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount
    );

    /// @dev Emitted when a gift is redeemed.
    event GiftRedeemed(
        address indexed redeemer,
        uint256 indexed tokenId,
        uint256 amount
    );

    // ===========================
    // ======== Constructor ======
    // ===========================

    /// @notice Initializes the ZoraGift contract.
    constructor() ERC721("ZoraGift", "ZGC") Ownable(_msgSender()) {}

    // ===========================
    // ======== Functions =========
    // ===========================

    /// @notice Returns the base URI for token metadata.
    /// @return The base URI as a string.
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs.io/ipfs/";
    }

    /// @notice Overrides the tokenURI function to return the correct metadata URI.
    /// @param tokenId The ID of the token.
    /// @return The metadata URI of the token.
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!exists(tokenId)) revert ZoraGift__TokenDoesNotExist();
        return
            string(abi.encodePacked(_baseURI(), s_tokenIdToIpfsHash[tokenId]));
    }

    /// @notice Sends a gift by minting an NFT to the recipient.
    /// @param to The address of the gift recipient.
    /// @param redemptionTimestamp The timestamp after which the gift can be redeemed. If 0, the gift is immediately redeemable.
    /// @param ipfsHash The IPFS hash for the token metadata.
    function sendGift(
        address to,
        uint64 redemptionTimestamp,
        string calldata ipfsHash
    ) external payable returns (uint256) {
        if (to == address(0)) revert ZoraGift__InvalidAddress();
        if (msg.value == 0) revert ZoraGift__ZeroValue();

        uint256 tokenId = s_nextTokenId++;

        // Set redemption timestamp if provided and more than 60 minutes into the future
        if (
            redemptionTimestamp > 0 &&
            redemptionTimestamp > uint64(block.timestamp + 60 minutes)
        ) {
            s_tokenIdToRedemptionTimestamp[tokenId] = redemptionTimestamp;
        }

        s_tokenIdToContributors[tokenId].push(_msgSender());
        s_tokenIdToContributions[tokenId].push(msg.value);
        s_tokenIdToTotalAmount[tokenId] += msg.value;
        s_tokenIdToIpfsHash[tokenId] = ipfsHash;

        _safeMint(to, tokenId);

        emit GiftSent(_msgSender(), to, tokenId, msg.value);
        return tokenId;
    }

    /// @notice Allows users to contribute to an existing gift.
    /// @param tokenId The ID of the token to contribute to.
    function addContribution(uint256 tokenId) external payable {
        if (msg.value == 0) revert ZoraGift__ContributionTooLow();
        if (!exists(tokenId)) revert ZoraGift__TokenDoesNotExist();

        // Check if the gift is still contributable
        uint64 redemptionTimestamp = s_tokenIdToRedemptionTimestamp[tokenId];
        if (
            (redemptionTimestamp != 0 &&
                uint64(block.timestamp) > redemptionTimestamp) ||
            redemptionTimestamp == 0
        ) {
            revert ZoraGift__NotContributable();
        }

        int256 contributorIndex = findContributorIndex(tokenId, _msgSender());

        if (contributorIndex == -1) {
            // New contributor
            s_tokenIdToContributors[tokenId].push(_msgSender());
            s_tokenIdToContributions[tokenId].push(msg.value);
        } else {
            // Existing contributor
            uint256 index = uint256(contributorIndex);
            s_tokenIdToContributions[tokenId][index] += msg.value;
        }
        s_tokenIdToTotalAmount[tokenId] += msg.value;
    }

    /// @notice Redeems the total amount associated with a tokenId.
    /// @param tokenId The ID of the token to redeem.
    function redeemGift(uint256 tokenId) external nonReentrant {
        if (!exists(tokenId)) revert ZoraGift__TokenDoesNotExist();
        if (ownerOf(tokenId) != _msgSender()) revert ZoraGift__NotTokenOwner();

        uint256 totalAmount = getTotalContributedAmount(tokenId);
        if (totalAmount == 0) revert ZoraGift__AlreadyRedeemed();

        delete s_tokenIdToTotalAmount[tokenId];

        (bool success, ) = _msgSender().call{value: totalAmount}("");
        if (!success) revert ZoraGift__TransferFailed();

        emit GiftRedeemed(_msgSender(), tokenId, totalAmount);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        if (
            s_tokenIdToContributors[tokenId].length == 0 ||
            ownerOf(tokenId) == address(0)
        ) return false;
        return true;
    }

    /// @notice Retrieves the index of a contributor for a specific tokenId.
    /// @param tokenId The ID of the token.
    /// @param contributor The address of the contributor.
    /// @return The index of the contributor in the contributors array, or -1 if not found.
    function findContributorIndex(
        uint256 tokenId,
        address contributor
    ) public view returns (int256) {
        address[] memory contributors = s_tokenIdToContributors[tokenId];
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i] == contributor) {
                return int256(i);
            }
        }

        return -1; // Contributor not found
    }

    function fetchGifts(
        address userAddress
    ) external view returns (uint256[] memory) {
        uint256 giftCount = balanceOf(userAddress);
        uint256[] memory allGifts = new uint256[](giftCount);
        for (uint256 i = 0; i < giftCount; i++) {
            allGifts[i] = tokenOfOwnerByIndex(userAddress, i);
        }

        return allGifts;
    }

    function getIpfsHash(
        uint256 tokenId
    ) external view returns (string memory) {
        return s_tokenIdToIpfsHash[tokenId];
    }

    /// @notice Retrieves the total amount contributed to a specific tokenId.
    /// @param tokenId The ID of the token.
    /// @return The total contributed amount.
    function getTotalContributedAmount(
        uint256 tokenId
    ) public view returns (uint256) {
        return s_tokenIdToTotalAmount[tokenId];
    }

    function getCollectedAmount(uint256 tokenId) public view returns (uint256) {
        uint256 totalAmount = 0;
        uint256[] memory amounts = getContributions(tokenId);
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        return totalAmount;
    }

    /// @notice Retrieves the list of contributors for a specific tokenId.
    /// @param tokenId The ID of the token.
    /// @return An array of contributor addresses.
    function getContributors(
        uint256 tokenId
    ) external view returns (address[] memory) {
        return s_tokenIdToContributors[tokenId];
    }

    /// @notice Retrieves the contribution amounts for a specific tokenId.
    /// @param tokenId The ID of the token.
    /// @return An array of contribution amounts corresponding to each contributor.
    function getContributions(
        uint256 tokenId
    ) public view returns (uint256[] memory) {
        return s_tokenIdToContributions[tokenId];
    }

    /// @notice Retrieves the next tokenId to be minted.
    /// @return The next tokenId.
    function getNextTokenId() external view returns (uint256) {
        return s_nextTokenId;
    }

    function getRedemtionTimeForTokenId(
        uint256 tokenId
    ) external view returns (uint64) {
        return s_tokenIdToRedemptionTimestamp[tokenId];
    }

    /// @notice Pauses all token transfers.
    function pauseContract() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses all token transfers.
    function unpauseContract() external onlyOwner {
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

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        return super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
