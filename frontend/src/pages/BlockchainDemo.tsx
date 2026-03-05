import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ErrorMessage } from '../components';

function truncateAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BlockchainDemo() {
  const {
    address,
    messages,
    txStatus,
    error,
    connect,
    disconnect,
    postMessage,
    refreshMessages,
    switchToExpectedChain,
    isConnected,
    currentChainId,
    expectedChainId,
  } = useWallet();
  const [messageInput, setMessageInput] = useState('');

  const handlePostMessage = async () => {
    if (!messageInput.trim()) return;
    const txHash = await postMessage(messageInput.trim());
    if (txHash) {
      setMessageInput('');
    }
  };

  return (
    <div>
      <h1>Blockchain Demo</h1>
      <p>Connect a Web3 wallet (e.g. MetaMask). Set <code>VITE_CHAIN_ID</code> and <code>VITE_CONTRACT_ADDRESS</code> in .env.</p>

      <p>
        <strong>Expected chain:</strong> {expectedChainId}
        {' | '}
        <strong>Wallet chain:</strong> {currentChainId ?? 'not connected'}
      </p>

      {error && <ErrorMessage message={error} />}

      {currentChainId != null && currentChainId !== expectedChainId && (
        <button type="button" onClick={switchToExpectedChain} style={{ marginBottom: '0.75rem' }}>
          Switch Wallet To {expectedChainId}
        </button>
      )}

      {!isConnected ? (
        <button type="button" onClick={connect}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>
            <strong>Address:</strong> {truncateAddress(address ?? '')}
            <button type="button" onClick={disconnect} style={{ marginLeft: '1rem' }}>
              Disconnect
            </button>
            <button type="button" onClick={refreshMessages} style={{ marginLeft: '0.75rem' }}>
              Refresh Messages
            </button>
          </p>

          <div style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>Post Message (write)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Write a message..."
                style={{ display: 'block', marginBottom: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: '400px' }}
            />
            <button
              type="button"
              onClick={handlePostMessage}
              disabled={txStatus === 'pending' || !messageInput.trim()}
            >
              {txStatus === 'pending' ? 'Pending…' : 'Post Message'}
            </button>
            {txStatus === 'success' && <span style={{ marginLeft: '0.5rem', color: 'green' }}>Success</span>}
            {txStatus === 'error' && <span style={{ marginLeft: '0.5rem', color: 'red' }}>Failed</span>}
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
            <h3 style={{ marginTop: 0, textAlign: 'left' }}>Latest Messages (read)</h3>
            {messages.length === 0 ? (
              <p style={{ marginTop: 0, marginBottom: 0, textAlign: 'left' }}>No messages yet.</p>
            ) : (
              <ul style={{ paddingLeft: '1rem', marginBottom: 0, textAlign: 'left' }}>
                {messages.map((msg, index) => (
                  <li key={`${msg.author}-${msg.timestamp}-${index}`} style={{ marginBottom: '0.5rem' }}>
                    <code>{truncateAddress(msg.author)}</code>: {msg.content}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
