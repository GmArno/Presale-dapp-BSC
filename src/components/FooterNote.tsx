// src/components/FooterNote.tsx
import React from 'react';

const FooterNote: React.FC = () => {
  return (
    <footer style={{
      marginTop: '64px',
      padding: '32px 0',
      borderTop: '1px solid rgba(0, 240, 255, 0.1)',
      textAlign: 'center',
      fontSize: '14px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <p style={{ marginBottom: '16px' }}>Audited by leading blockchain security firms</p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '8px'
          }}>
            <span className="glow-cyan" style={{ fontWeight: 'bold' }}>SPYWOLF</span>
          </div>
          <div style={{
            padding: '12px',
            background: 'rgba(180, 0, 255, 0.1)',
            border: '1px solid rgba(180, 0, 255, 0.2)',
            borderRadius: '8px'
          }}>
            <span className="glow-purple" style={{ fontWeight: 'bold' }}>VERIFYLAB</span>
          </div>
        </div>
        <p style={{ fontSize: '12px' }}>
          © {new Date().getFullYear()} PRESALE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterNote;