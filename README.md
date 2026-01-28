# RedbellyAuth v2 Protocol

RedbellyAuth is a decentralized access control layer designed for the Redbelly Network. It solves the compliance-privacy trilemma by enabling region-gated DAO onboarding without exposing user PII on-chain.

The system utilizes a hybrid verification model:
1.  **Layer 1 (Network):** Verifies the wallet's Compliant Asset Token (CAT) status via the Redbelly `Permission` contract.
2.  **Layer 2 (Protocol):** Enforces region-specific quotas and sybil resistance using nullifier hashes derived from off-chain credentials.

## Architecture

* **RegionGuard (Smart Contract):** Manages quotas, access registry, and replay protection.
* **SDK (TypeScript):** Handles wallet connection, network verification, and ZK-proof payload generation.
* **Privacy:** Region identifiers are hashed (`keccak256`) before transmission to maintain data confidentiality.

## Technology Stack

* **Network:** Redbelly Network (Testnet)
* **Languages:** Solidity v0.8.20, TypeScript
* **Framework:** Hardhat, Ethers.js v6

## Repository Structure
├── contracts/ # Solidity Smart Contracts ├── ignition/ # Deployment Modules ├── sdk/ # Client-side TypeScript SDK ├── scripts/ # Integration & Test Scripts └── hardhat.config.ts # Network Configuration

## SDK Usage

The project exports a TypeScript class for frontend integration:

```typescript
import { RedbellyAuth } from "./sdk/src/RedbellyAuth";

// 1. Initialize (Browser Mode)
const auth = new RedbellyAuth(window.ethereum);

// 2. Connect Wallet
await auth.connectWallet();

// 3. Verify Network Status (Layer 1)
const isVerified = await auth.verifyNetworkStatus();

// 4. Join DAO (Layer 2)
if (isVerified) {
    try {
        await auth.joinDAO("NG"); // "NG" = Nigeria
        console.log("Welcome to the DAO");
    } catch (err) {
        console.error("Access Denied:", err.message);
    }
}


Deployment Guide

1. Installation

Bash
npm install

2. Configuration
Create a .env file in the root directory:

Bash
PRIVATE_KEY=your_private_key

3. Operations
Deploy Contracts:

Bash
npx hardhat ignition deploy ./ignition/modules/RegionGuard.ts --network redbellyTestnet
Run Integration Tests:

Bash
npx hardhat run scripts/test-full-flow.ts --network redbellyTestnet

License
MIT
