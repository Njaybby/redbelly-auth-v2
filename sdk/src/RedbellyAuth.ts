import { ethers } from "ethers";
// @ts-ignore
import * as snarkjs from "snarkjs";
import { 
    REGION_GUARD_ABI, 
    BOOTSTRAP_ABI, 
    PERMISSION_ABI, 
    BOOTSTRAP_ADDRESS, 
    DEFAULTS 
} from "./types";

export class RedbellyAuth {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private userAddress: string | null = null;

  // Contract Instances
  private regionGuard: ethers.Contract;
  private bootstrap: ethers.Contract;
  private permission: ethers.Contract | null = null;

  /**
   * Initializes the SDK with either a Browser Provider (Metamask) or a Signer (Hardhat/Tests).
   */
  constructor(providerOrSigner: any, regionGuardAddress: string = DEFAULTS.CONTRACT_ADDRESS) {
    if (providerOrSigner.signMessage || providerOrSigner.address) {
        // Handle Signer (Testing/Node environment)
        this.signer = providerOrSigner;
        this.provider = providerOrSigner.provider;
    } else if (providerOrSigner.request || providerOrSigner.send) {
        // Handle Provider (Browser/Metamask)
        this.provider = new ethers.BrowserProvider(providerOrSigner);
    } else {
        // Handle raw Ethers provider
        this.provider = providerOrSigner;
    }

    this.regionGuard = new ethers.Contract(regionGuardAddress, REGION_GUARD_ABI, this.provider);
    this.bootstrap = new ethers.Contract(BOOTSTRAP_ADDRESS, BOOTSTRAP_ABI, this.provider);
  }

  async connectWallet() {
    if (this.signer) {
        this.userAddress = await this.signer.getAddress();
        this.regionGuard = this.regionGuard.connect(this.signer);
        this.bootstrap = this.bootstrap.connect(this.signer);
        return this.userAddress;
    }

    if (this.provider instanceof ethers.BrowserProvider) {
        this.signer = await this.provider.getSigner();
        this.userAddress = await this.signer.getAddress();
        
        this.regionGuard = this.regionGuard.connect(this.signer);
        this.bootstrap = this.bootstrap.connect(this.signer);
        return this.userAddress;
    }

    throw new Error("No valid signer found. Please pass a Signer or window.ethereum");
  }

  /**
   * Verifies if the connected wallet is KYC/whitelisted on the Redbelly Network.
   */
  async verifyNetworkStatus(): Promise<boolean> {
    if (!this.userAddress) await this.connectWallet();

    const permissionAddr = await this.bootstrap.getContractAddress("permission");
    this.permission = new ethers.Contract(permissionAddr, PERMISSION_ABI, this.provider);
    
    return await this.permission.isAllowed(this.userAddress);
  }

  /**
   * Attempts to join the DAO for a specific region.
   * Performs network verification and ZK-proof submission.
   * @param regionCode - ISO Country Code (e.g., "NG", "US")
   */
  async joinDAO(regionCode: string) {
    if (!this.userAddress) await this.connectWallet();

    const isEligible = await this.verifyNetworkStatus();
    if (!isEligible) {
        throw new Error("Access Denied: Wallet not verified on Redbelly Network.");
    }

    const regionHash = ethers.keccak256(ethers.toUtf8Bytes(regionCode));
    const nullifierHash = ethers.keccak256(
        ethers.solidityPacked(["string", "string"], [this.userAddress, "RedbellyDAO"])
    );

    // Mock Proof (Placeholder for snarkjs integration)
    const proof = ethers.toUtf8Bytes("mock-proof");

    try {
      const tx = await this.regionGuard.requestAccess(regionHash, nullifierHash, proof);
      return await tx.wait();
    } catch (error: any) {
      if (error.reason) throw new Error(`Contract Error: ${error.reason}`);
      throw error;
    }
  }
}
