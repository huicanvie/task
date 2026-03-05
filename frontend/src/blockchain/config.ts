/**
 * Blockchain config – set chain and contract in .env (VITE_CHAIN_ID, VITE_CONTRACT_ADDRESS).
 */

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 1);
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? '') as `0x${string}`;
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';

export const SUPPORTED_CHAINS = [1, 11155111, 1337] as const; // 1337 = local anvil
