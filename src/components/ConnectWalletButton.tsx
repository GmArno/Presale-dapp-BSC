
import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletConnectErrorBoundary } from './WalletConnectErrorBoundary';

const ConnectWalletButton: React.FC = () => {
  const { 
    walletAddress, 
    isConnecting, 
    error,
    disconnectWallet 
  } = useWallet();
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <WalletConnectErrorBoundary>
      <div style={{ position: 'relative' }}>
        <button
          onClick={walletAddress ? disconnectWallet : () => {}}
          disabled={isConnecting}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.3s',
            ...(walletAddress ? {
              background: 'transparent',
              border: '2px solid #00FFC2',
              color: '#00FFC2',
              ...(isHovered && {
                background: 'rgba(0, 255, 194, 0.1)',
                boxShadow: '0 0 15px #00FFC2'
              })
            } : {
              background: 'transparent',
              border: '2px solid #00FFC2',
              color: '#00FFC2',
              cursor: 'default'
            }),
            ...(isConnecting && {
              opacity: 0.7,
              cursor: 'not-allowed'
            })
          }}
        >
          {isConnecting ? 'Connecting...' : 
           walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : 
           'Not Connected'}
        </button>

        {error && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(255, 0, 102, 0.1)',
            border: '1px solid #FF0066',
            borderRadius: '8px',
            color: '#FF0066',
            fontSize: '12px',
            maxWidth: '320px'
          }}>
            {error.includes('undefined') 
              ? 'Connection error' 
              : error}
          </div>
        )}
      </div>
    </WalletConnectErrorBoundary>
  );
};

export default ConnectWalletButton;