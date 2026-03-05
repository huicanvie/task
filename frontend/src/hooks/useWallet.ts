import { useState, useCallback, useEffect } from 'react';
import { createWalletClient, custom, type Address } from 'viem';
import { CHAIN_ID, chain, publicClient, readMessages, writePostMessage, type MessageItem } from '../blockchain';

export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const getWalletClient = useCallback(() => {
    const provider = typeof window !== 'undefined' ? window.ethereum : undefined;
    if (!provider) return null;
    return createWalletClient({
      chain,
      transport: custom(provider),
    });
  }, []);

  const formatWrongNetworkMessage = (walletChainId: number | null) => {
    if (walletChainId == null) {
      return `Wrong network. Expected chain ${CHAIN_ID}.`;
    }
    return `Wrong network. Wallet chain=${walletChainId}, expected=${CHAIN_ID}.`;
  };

  const refreshMessages = useCallback(async () => {
    try {
      const nextMessages = await readMessages(20);
      setMessages(nextMessages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read messages');
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const provider = window.ethereum;
      if (!provider) {
        setError('No wallet found. Install MetaMask or another Web3 wallet.');
        return;
      }
      const [acc] = (await provider.request({ method: 'eth_requestAccounts' })) as Address[];
      if (!acc) return;
      const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
      const walletChainId = Number.parseInt(chainIdHex, 16);
      setCurrentChainId(walletChainId);
      if (walletChainId !== CHAIN_ID) {
        setError(formatWrongNetworkMessage(walletChainId));
      }
      setAddress(acc);
      await refreshMessages();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    }
  }, [refreshMessages]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setMessages([]);
    setError(null);
    setTxStatus('idle');
    setCurrentChainId(null);
  }, []);

  const postMessage = useCallback(
    async (content: string) => {
      if (!address) {
        setError('Connect wallet first');
        return;
      }
      const walletClient = getWalletClient();
      if (!walletClient) {
        setError('Wallet not available');
        return;
      }
      if (currentChainId !== CHAIN_ID) {
        setError(formatWrongNetworkMessage(currentChainId));
        return;
      }
      setTxStatus('pending');
      setError(null);
      try {
        const hash = await writePostMessage(walletClient, address, content);
        await publicClient.waitForTransactionReceipt({ hash });
        setTxStatus('success');
        await refreshMessages();
        return hash;
      } catch (e) {
        setTxStatus('error');
        setError(e instanceof Error ? e.message : 'Transaction failed');
      }
    },
    [address, currentChainId, getWalletClient, refreshMessages]
  );

  useEffect(() => {
    if (!address) return;

    // Defer refresh to avoid synchronous state updates in effect body.
    const timer = window.setTimeout(() => {
      void refreshMessages();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [address, refreshMessages]);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts: unknown) => {
      const acc = (accounts as Address[])?.[0];
      setAddress(acc ?? null);
      if (!acc) setMessages([]);
    };
    const onChainChanged = (nextChainIdHex: unknown) => {
      const nextChainId = Number.parseInt(String(nextChainIdHex), 16);
      setCurrentChainId(nextChainId);
      if (nextChainId !== CHAIN_ID) {
        setError(formatWrongNetworkMessage(nextChainId));
      } else {
        setError((prev) => (prev?.startsWith('Wrong network') ? null : prev));
      }
    };
    window.ethereum.on?.('accountsChanged', onAccountsChanged);
    window.ethereum.on?.('chainChanged', onChainChanged);
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', onAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', onChainChanged);
    };
  }, []);

  const switchToExpectedChain = useCallback(async () => {
    const provider = window.ethereum;
    if (!provider) {
      setError('No wallet found. Install MetaMask or another Web3 wallet.');
      return;
    }

    const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      setError(null);
    } catch {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: CHAIN_ID === 1337 ? 'Anvil Local' : `Chain ${CHAIN_ID}`,
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
            },
          ],
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to switch wallet network');
      }
    }
  }, []);

  return {
    address,
    txStatus,
    error,
    connect,
    disconnect,
    postMessage,
    refreshMessages,
    switchToExpectedChain,
    isConnected: !!address,
    currentChainId,
    expectedChainId: CHAIN_ID,
    messages,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, cb: (args: unknown) => void) => void;
      removeListener?: (event: string, cb: (args: unknown) => void) => void;
    };
  }
}
