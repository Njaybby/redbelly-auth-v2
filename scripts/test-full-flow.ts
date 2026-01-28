import { ethers } from "hardhat";
import { RedbellyAuth } from "../sdk/src/RedbellyAuth";

async function main() {
  console.log("Starting System Integration Test...");

  const [deployer] = await ethers.getSigners();
  console.log(`User: ${deployer.address}`);

  const auth = new RedbellyAuth(deployer);
  await auth.connectWallet();

  // 1. Network Eligibility Check
  try {
      const isAllowed = await auth.verifyNetworkStatus();
      if (!isAllowed) {
          console.error("Test Failed: User not KYC verified.");
          return;
      }
      console.log("Network Status: Verified");
  } catch (e) {
      console.error("Network Verification Error:", e);
      return;
  }

  // 2. DAO Access Check
  try {
      // Setup environment: Ensure capacity exists
      const contract = await ethers.getContractAt("RegionGuard", "0x54A457771206506285aefED5cABbE241630b1d28", deployer);
      const regionHash = ethers.keccak256(ethers.toUtf8Bytes("NG"));
      await (await contract.setRegionCap(regionHash, 50)).wait();
      
      console.log("Joining DAO (Region: NG)...");
      await auth.joinDAO("NG");
      console.log("DAO Access: Granted");
  } catch (e: any) {
      if (e.message?.includes("Credential already used") || e.message?.includes("Wallet already has access")) {
          console.log("Test Result: Pass (Duplicate Entry Blocked)");
      } else {
          console.error("DAO Access Failed:", e);
      }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
