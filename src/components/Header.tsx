
// src/components/Header.tsx
import React from 'react';
import ConnectWalletButton from './ConnectWalletButton';

const Header: React.FC = () => {
  return (
    <header style={{
      width: '100%',
      padding: '24px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <img 
    src="/fansngage-logo.png" 
    alt="Fansngage Logo" 
    style={{ height: '60px', objectFit: 'contain' }} 
  />
</div>

      <ConnectWalletButton />
    </header>
  );
};

export default Header;