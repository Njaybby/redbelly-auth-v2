import { ethers } from "hardhat";
import { RedbellyAuth } from "../sdk/src/RedbellyAuth";
import { DEFAULTS } from "../sdk/src/types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Starting SDK Integration Test with account: ${deployer.address}`);

  // 1. Initialize SDK
  // We pass the Hardhat Signer directly, demonstrating the SDK's environment agility
  const auth = new RedbellyAuth(deployer);
  await auth.connectWallet();

  // 2. Admin Setup: Set Region Capacity
  // This step ensures the test environment is ready for a join action
  const contract = await ethers.getContractAt("RegionGuard", DEFAULTS.CONTRACT_ADDRESS, deployer);
  const regionCode = "NG";
  const regionHash = ethers.keccak256(ethers.toUtf8Bytes(regionCode));
  
  console.log(`Setting capacity for region ${regionCode}...`);
  const capTx = await contract.setRegionCap(regionHash, 10);
  await capTx.wait();

  // 3. Execute SDK Action: Join DAO
  console.log(`Attempting to join DAO via SDK...`);
  try {
      await auth.joinDAO(regionCode);
      console.log("Success: User added to DAO.");
  } catch (error: any) {
      if (error.message && error.message.includes("Wallet already has access")) {
          console.log("Info: User is already a member. Step skipped.");
      } else {
          console.error("Failure:", error);
          process.exit(1);
      }
  }

  // 4. Verification
  const count = await contract.regionCounts(regionHash);
  console.log(`Current Member Count for ${regionCode}: ${count}/10`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
