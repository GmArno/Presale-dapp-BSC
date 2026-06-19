import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getAvailableWallets } from '../utils/WalletUtils';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  isPopular?: boolean;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, error, isConnecting } = useWallet();
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const wallets = getAvailableWallets(showAllWallets);

  const handleWalletClick = async (walletId: string) => {
    try {
      setConnectionError(null);
      await connectWallet(walletId);
      onClose();
    } catch (error: any) {
      setConnectionError(
        error.message.includes('User rejected') 
          ? 'Connection cancelled by user'
          : error.message || 'Failed to connect wallet'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        width: '440px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            color: 'white',
            fontWeight: 600 
          }}>
            Connect Wallet
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer',
              padding: '0 8px'
            }}
          >
            &times;
          </button>
        </div>
        
        {(connectionError || error) && (
          <div style={{
            background: 'rgba(255, 0, 102, 0.1)',
            border: '1px solid rgba(255, 0, 102, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#FF0066',
            fontSize: '0.9rem'
          }}>
            {connectionError || error}
            {(connectionError || error)?.includes('Install it:') && (
              <a 
                href={(connectionError || error)?.split('Install it: ')[1]} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  marginLeft: '5px',
                  color: '#00FFC2',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                (Install Now)
              </a>
            )}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {wallets.map((wallet) => (
            <WalletButton 
              key={wallet.id}
              wallet={wallet}
              onClick={() => handleWalletClick(wallet.id)}
              isConnecting={isConnecting}
            />
          ))}
        </div>

        {!showAllWallets && (
          <button
            onClick={() => setShowAllWallets(true)}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
            style={{
              width: '100%',
              padding: '12px',
              background: hoveredButton 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              margin: '16px 0',
              transition: 'all 0.2s ease'
            }}
          >
            Show More Wallets
          </button>
        )}

        <div style={{
          marginTop: '28px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem'
        }}>
          <p>New to Ethereum wallets?</p>
          <a 
            href="https://ethereum.org/en/wallets/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#00FFC2',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
};

interface WalletButtonProps {
  wallet: WalletInfo;
  onClick: () => void;
  isConnecting: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ wallet, onClick, isConnecting }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={isConnecting}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: isHovered 
          ? 'rgba(0, 255, 194, 0.1)' 
          : 'rgba(255, 255, 255, 0.05)',
        border: isHovered
          ? '1px solid #00FFC2'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px 16px',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        color: 'white',
        transform: isHovered && !isConnecting ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered 
          ? '0 4px 15px rgba(0, 255, 194, 0.2)'
          : 'none',
        opacity: isConnecting ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isConnecting && isHovered && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(to right, #00FFC2, #0088FF)',
          animation: 'loading 1.5s infinite linear'
        }} />
      )}
      <img 
        src={wallet.icon} 
        alt={wallet.name} 
        style={{ 
          width: '48px', 
          height: '48px', 
          marginBottom: '12px',
          borderRadius: '50%',
          objectFit: 'contain',
          filter: isConnecting ? 'grayscale(50%)' : 'none'
        }} 
      />
      <span style={{ fontWeight: 600, marginBottom: '6px' }}>
        {wallet.name}
      </span>
      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
        {wallet.description}
      </span>
    </button>
  );
};

export default WalletModal;