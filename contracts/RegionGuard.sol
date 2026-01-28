// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RegionGuard
 * @notice Manages region-gated access control for the Redbelly DAO.
 * @dev Implements RBAC and ReentrancyGuard for security.
 */
contract RegionGuard is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Mapping of Region Hash to current member count
    mapping(bytes32 => uint256) public regionCounts;
    
    /// @notice Mapping of Region Hash to maximum capacity
    mapping(bytes32 => uint256) public regionCaps;
    
    /// @notice Nullifier tracking to prevent replay attacks
    mapping(bytes32 => bool) public nullifiers;
    
    /// @notice Access registry for individual wallets
    mapping(address => bool) public hasAccess;

    event AccessGranted(address indexed user, bytes32 indexed regionHash);
    event RegionCapUpdated(bytes32 indexed regionHash, uint256 newCap);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Requests access to the DAO for a specific region.
     * @param regionHash Keccak256 hash of the region code (e.g., keccak256("NG")).
     * @param nullifierHash Unique hash derived from user credentials to prevent double-spending.
     * @param proof ZK-SNARK proof data for off-chain verification.
     */
    function requestAccess(
        bytes32 regionHash, 
        bytes32 nullifierHash,
        bytes calldata proof
    ) external nonReentrant {
        require(!hasAccess[msg.sender], "Wallet already has access");
        require(!nullifiers[nullifierHash], "Credential already used");

        uint256 currentCount = regionCounts[regionHash];
        uint256 cap = regionCaps[regionHash];
        
        require(cap > 0, "Region not initialized");
        require(currentCount < cap, "Region capacity reached");

        // Logic for ZK proof verification would be inserted here
        // Currently relies on optimistic verification for the prototype phase

        nullifiers[nullifierHash] = true;
        regionCounts[regionHash] = currentCount + 1;
        hasAccess[msg.sender] = true;

        emit AccessGranted(msg.sender, regionHash);
    }

    /**
     * @notice Sets the maximum capacity for a specific region.
     * @dev Only callable by accounts with ADMIN_ROLE.
     */
    function setRegionCap(bytes32 regionHash, uint256 cap) external onlyRole(ADMIN_ROLE) {
        regionCaps[regionHash] = cap;
        emit RegionCapUpdated(regionHash, cap);
    }
}
