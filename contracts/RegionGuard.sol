// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RegionGuard is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Auto-opens new countries with 10 slots
    uint256 public constant DEFAULT_CAP = 10; 

    mapping(bytes32 => uint256) public regionCounts;
    mapping(bytes32 => uint256) public regionCaps;
    mapping(bytes32 => bool) public nullifiers;
    mapping(address => bool) public hasAccess;

    event AccessGranted(address indexed user, bytes32 indexed regionHash);
    event RegionCapUpdated(bytes32 indexed regionHash, uint256 newCap);
    event RegionInitialized(bytes32 indexed regionHash, uint256 cap);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function requestAccess(
        bytes32 regionHash, 
        bytes32 nullifierHash,
        bytes calldata proof
    ) external nonReentrant {
        require(!hasAccess[msg.sender], "Wallet already has access");
        require(!nullifiers[nullifierHash], "Credential already used");

        uint256 currentCount = regionCounts[regionHash];
        uint256 cap = regionCaps[regionHash];
        
        // --- LAZY INIT LOGIC ---
        // If cap is 0, this is a new country. Open it up!
        if (cap == 0) {
            cap = DEFAULT_CAP;
            regionCaps[regionHash] = cap;
            emit RegionInitialized(regionHash, cap);
        }

        require(currentCount < cap, "Region capacity reached");

        // (ZK Verification placeholder)

        nullifiers[nullifierHash] = true;
        regionCounts[regionHash] = currentCount + 1;
        hasAccess[msg.sender] = true;

        emit AccessGranted(msg.sender, regionHash);
    }

    function setRegionCap(bytes32 regionHash, uint256 cap) external onlyRole(ADMIN_ROLE) {
        regionCaps[regionHash] = cap;
        emit RegionCapUpdated(regionHash, cap);
    }
}
