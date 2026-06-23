import React from 'react';
import { useWeb3 } from '../utils/useWeb3';

/**
 * Reusable wallet connect button.
 * Shows: Connect | Wrong Network | short address
 */
export default function WalletConnect() {
  const {
    account,
    isConnecting,
    isCorrectNetwork,
    error,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWeb3();

  const short = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  if (account && !isCorrectNetwork) {
    return (
      <button
        onClick={switchToSepolia}
        style={styles.wrongNetwork}
        title="Click to switch to Sepolia"
      >
        ⚠ Wrong Network
      </button>
    );
  }

  if (account) {
    return (
      <div style={styles.connected}>
        <span style={styles.dot} />
        <span style={styles.address}>{short(account)}</span>
        <button onClick={disconnectWallet} style={styles.disconnect} title="Disconnect">✕</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        style={styles.connect}
      >
        {isConnecting ? 'Connecting...' : '🦊 Connect Wallet'}
      </button>
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  connect: {
    padding: '8px 18px',
    background: 'linear-gradient(90deg, #f6851b 0%, #e2761b 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(246,133,27,0.25)',
    transition: 'transform 0.15s',
    whiteSpace: 'nowrap',
  },
  connected: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(0,255,170,0.08)',
    border: '1.5px solid #00ffaa55',
    borderRadius: 8,
    padding: '6px 14px',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#00ffaa',
    display: 'inline-block',
    boxShadow: '0 0 6px #00ffaa',
  },
  address: {
    color: '#00ffaa',
    fontWeight: 600,
    fontSize: '0.95rem',
    fontFamily: 'monospace',
  },
  disconnect: {
    background: 'none',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: '0 2px',
  },
  wrongNetwork: {
    padding: '8px 18px',
    background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  error: {
    color: '#f87171',
    fontSize: '0.78rem',
    maxWidth: 200,
    textAlign: 'right',
  },
};
