# Foundry Contract Setup

## Contract

- `src/MessageBoard.sol`
- Features:
  - Write: `postMessage(string)`
  - Read count: `getMessageCount()`
  - Read item: `getMessage(uint256)`

## Prerequisites

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Build

```bash
cd contracts
forge build
```

## Test

```bash
forge test
```

Current tests cover:

- posting a message
- reading count and item data
- revert on empty message
- revert on out-of-bounds index
- event emission

## Deploy to Sepolia

1. Create env file:

```bash
cp .env.example .env
```

2. Fill `.env` values:

- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`

3. Deploy `MessageBoard`:

```bash
forge script script/DeployMessageBoard.s.sol:DeployMessageBoard \
  --rpc-url sepolia \
  --broadcast
```

`DeployMessageBoard.s.sol` reads `PRIVATE_KEY` directly via `vm.envUint("PRIVATE_KEY")`.

4. Copy the deployed contract address to frontend env:

```bash
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_CONTRACT_ADDRESS=0x...
```

## Optional: Verify contract on Sepolia Etherscan

```bash
forge verify-contract <CONTRACT_ADDRESS> src/MessageBoard.sol:MessageBoard \
  --chain sepolia \
  --etherscan-api-key <ETHERSCAN_API_KEY>
```

## Local fallback (if needed)

```bash
anvil --host 127.0.0.1 --port 8545 --chain-id 1337
```

Then deploy locally:

```bash
cd contracts
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
forge script script/DeployMessageBoard.s.sol:DeployMessageBoard \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```
