 // src/components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progress: number;
  currentPrice: number;
  raisedTotal: number;
  isLoading: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  currentPrice, 
  raisedTotal, 
  isLoading 
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{
      width: '100%',
      marginBottom: '32px',
      padding: '28px',
      background: 'linear-gradient(135deg, rgba(10, 20, 40, 0.8) 0%, rgba(5, 15, 30, 0.9) 100%)',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Rajdhani", sans-serif'
    }}>
      {/* Animated border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)',
        animation: 'scanline 3s linear infinite'
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 8px rgba(0, 240, 255, 0.7)',
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '1px',
          margin: 0
        }}>
          PRESALE PROGRESS
        </h3>
        <span style={{
          fontSize: '16px',
          background: 'var(--neon-cyan)',
          color: 'black',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontWeight: 'bold',
          fontFamily: '"Roboto Mono", monospace',
          boxShadow: '0 0 10px var(--neon-cyan)'
        }}>
          ${currentPrice.toFixed(6)}
        </span>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '3px solid rgba(0, 240, 255, 0.3)',
            borderTopColor: 'var(--neon-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : (
        <>
          <div style={{
            width: '100%',
            height: '14px',
            background: 'rgba(0, 240, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginBottom: '12px',
            boxShadow: 'inset 0 0 8px rgba(0, 240, 255, 0.3)'
          }}>
            <div 
              style={{
                height: '100%',
                background: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple))',
                borderRadius: '9999px',
                transition: 'width 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
                width: `${clampedProgress}%`,
                boxShadow: '0 0 10px var(--neon-cyan)'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '16px',
            fontFamily: '"Roboto Mono", monospace'
          }}>
            <span>0%</span>
            <span style={{ 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 0 8px var(--neon-cyan)',
              fontFamily: '"Roboto Mono", monospace'
            }}>
              {clampedProgress.toFixed(2)}%
            </span>
            <span>100%</span>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 0 8px var(--neon-cyan)',
            fontFamily: '"Roboto Mono", monospace',
            background: 'rgba(0, 240, 255, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 240, 255, 0.3)'
          }}>
            Raised: ${raisedTotal.toLocaleString()}
          </div>
        </>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;