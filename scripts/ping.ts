import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x54A457771206506285aefED5cABbE241630b1d28";

  const RegionGuard = await ethers.getContractFactory("RegionGuard");
  const contract = RegionGuard.attach(CONTRACT_ADDRESS);

  console.log(`Verifying contract connectivity at: ${CONTRACT_ADDRESS}`);

  try {
    // Check Admin Role (Read Operation)
    const adminRole = await contract.ADMIN_ROLE();
    console.log("Contract responded successfully.");
    console.log(`Admin Role Hash: ${adminRole}`);

    // Verify Access Control Logic
    const zeroAddressAccess = await contract.hasAccess("0x0000000000000000000000000000000000000000");
    console.log(`Public Access Status: ${zeroAddressAccess}`); 

  } catch (error) {
    console.error("Contract connection failed or network unreachable.");
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
