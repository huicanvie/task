import { createPublicClient, createWalletClient, defineChain, http, type Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CHAIN_ID, CONTRACT_ADDRESS, RPC_URL } from './config';

const anvil = defineChain({
  id: 1337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
});

export const chain = CHAIN_ID === 11155111 ? sepolia : CHAIN_ID === 1337 ? anvil : mainnet;

export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

export type MessageItem = {
  author: Address;
  content: string;
  timestamp: bigint;
};

export const MESSAGE_BOARD_ABI = [
  {
    name: 'getMessageCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getMessage',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [
      { name: 'author', type: 'address' },
      { name: 'content', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    name: 'postMessage',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'content', type: 'string' }],
    outputs: [],
  },
] as const;

export async function readMessageCount(): Promise<bigint> {
  if (!CONTRACT_ADDRESS) return 0n;
  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: MESSAGE_BOARD_ABI,
    functionName: 'getMessageCount',
  });
}

export async function readMessages(limit = 20): Promise<MessageItem[]> {
  if (!CONTRACT_ADDRESS) return [];

  const total = await readMessageCount();
  if (total === 0n) return [];

  const count = Number(total);
  const start = Math.max(0, count - limit);
  const messages: MessageItem[] = [];

  for (let i = start; i < count; i += 1) {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MESSAGE_BOARD_ABI,
      functionName: 'getMessage',
      args: [BigInt(i)],
    });

    const [author, content, timestamp] = result as readonly [Address, string, bigint];
    messages.push({ author, content, timestamp });
  }

  return messages.reverse();
}

export async function writePostMessage(
  walletClient: ReturnType<typeof createWalletClient>,
  account: Address,
  content: string
) {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not set');

  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: MESSAGE_BOARD_ABI,
    functionName: 'postMessage',
    args: [content],
    account,
    chain,
  });
}
