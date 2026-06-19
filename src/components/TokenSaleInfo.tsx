import React from 'react';
import { PresaleData } from '../utils/PresaleContract';

const TokenSaleInfo: React.FC<{ tokenData: PresaleData | null }> = ({ tokenData }) => {
  if (!tokenData) return null;

  // Define animations in a style tag without jsx property
  const animationStyles = `
    @keyframes scanline {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes float {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }
    .text-gradient {
      background: linear-gradient(90deg, var(--neon-cyan), var(--neon-purple));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  `;

  return (
    <div style={{
      color: 'white',
      background: 'linear-gradient(135deg, rgba(10, 20, 40, 0.8) 0%, rgba(5, 15, 30, 0.9) 100%)',
      padding: '28px',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      backdropFilter: 'blur(8px)',
      fontFamily: '"Rajdhani", "Orbitron", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Add animation styles */}
      <style>{animationStyles}</style>

      {/* Animated border effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
        animation: 'scanline 3s linear infinite'
      }} />
      
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        textShadow: '0 0 10px rgba(0, 240, 255, 0.7)',
        letterSpacing: '1px',
        fontFamily: '"Orbitron", sans-serif'
      }}>
        <span style={{ 
          color: 'var(--neon-cyan)',
          filter: 'drop-shadow(0 0 8px var(--neon-cyan))'
        }}>🚀</span> 
        <span style={{
          background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>FansNgage PRESALE</span>
      </h2>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
        position: 'relative'
      }}>
        {[
          { 
            label: 'CURRENT STAGE PRICE', 
            value: `$${tokenData.currentPrice.toFixed(6)}`, 
            highlight: 'var(--neon-cyan)',
            icon: '⏳',
            font: '"Roboto Mono", monospace' // More readable font for numbers
          },
          { 
            label: 'NEXT STAGE PRICE', 
            value: `$${tokenData.nextRoundPrice.toFixed(6)}`, 
            highlight: 'var(--neon-purple)',
            icon: '⏭️',
            font: '"Roboto Mono", monospace'
          },
          { 
            label: 'USD RAISED', 
            value: `$${tokenData.raisedTotal.toFixed(2)}`, 
            highlight: 'var(--neon-pink)',
            icon: '💰',
            
            font: '"Roboto Mono", monospace'
          },
          { 
            label: 'TOKENS SOLD', 
            value: `${tokenData.sold.toLocaleString()}/40,000,000`, 
            highlight: 'var(--neon-green)',
            icon: '🪙',
           
            font: '"Roboto Mono", monospace'
          },
          { 
            label: 'UNIQUE BUYERS', 
            value: tokenData.totalBuyers.toLocaleString(), 
            highlight: 'var(--neon-cyan)',
            icon: '👥',
            font: '"Roboto Mono", monospace'
          }
        ].map((item, index) => (
          <div key={index} style={{
            background: 'rgba(0, 20, 40, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '4px',
              background: item.highlight,
              boxShadow: `0 0 10px ${item.highlight}`
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '20px',
                color: item.highlight,
                filter: `drop-shadow(0 0 4px ${item.highlight})`
              }}>{item.icon}</span>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontFamily: '"Orbitron", sans-serif'
                }}>{item.label}</div>
                
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  textShadow: `0 0 8px ${item.highlight}`,
                  letterSpacing: '0.5px',
                  fontFamily: item.font,
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>{item.value}</div>
                
              
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.5,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`
          }} />
        ))}
      </div>
    </div>
  );
};

export default TokenSaleInfo;