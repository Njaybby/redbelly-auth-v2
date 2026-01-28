import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegionGuardModule = buildModule("RegionGuardModule", (m) => {
  const regionGuard = m.contract("RegionGuard");
  return { regionGuard };
});

export default RegionGuardModule;
