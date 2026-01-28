export const BOOTSTRAP_ADDRESS = "0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5";

export const BOOTSTRAP_ABI = [
  "function getContractAddress(string memory contractName) public view returns (address)"
];

export const PERMISSION_ABI = [
  "function isAllowed(address _address) public view returns (bool)"
];

export const REGION_GUARD_ABI = [
  "function requestAccess(bytes32 regionHash, bytes32 nullifierHash, bytes calldata proof) external",
  "function hasAccess(address user) external view returns (bool)",
  "function regionCounts(bytes32 regionHash) external view returns (uint256)",
  "function regionCaps(bytes32 regionHash) external view returns (uint256)",
  "function setRegionCap(bytes32 regionHash, uint256 cap) external",
  "event AccessGranted(address indexed user, bytes32 indexed regionHash)"
];

export const DEFAULTS = {
    CONTRACT_ADDRESS: "0x54A457771206506285aefED5cABbE241630b1d28" 
};
