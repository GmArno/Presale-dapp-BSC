// src/components/HeroSection.tsx
import React from 'react';

interface HeroSectionProps {
  tokenName?: string;
  isLoading?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  tokenName = "FansNgage", 
  isLoading = false 
}) => {
  return (
    <section style={{
      position: 'relative',
      textAlign: 'center',
      padding: '48px 16px',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.2,
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '128px',
          height: '128px',
          borderRadius: '50%',
          background: 'var(--neon-cyan)',
          filter: 'blur(48px)',
          opacity: 0.1,
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'var(--neon-purple)',
          filter: 'blur(48px)',
          opacity: 0.1,
          animation: 'pulse 2s infinite',
          animationDelay: '1s'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {isLoading ? (
          <div style={{
            height: '48px',
            width: '256px',
            margin: '0 auto 24px',
            background: 'rgba(0, 240, 255, 0.1)',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }}></div>
        ) : (
          <h1 className="glow-cyan" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {tokenName} PRESALE
          </h1>
        )}
        
        <p style={{
          fontSize: '20px',
          color: 'var(--neon-cyan)',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          {isLoading ? (
            <span style={{
              display: 'inline-block',
              height: '24px',
              width: '192px',
              background: 'rgba(0, 240, 255, 0.1)',
              borderRadius: '4px',
              animation: 'pulse 2s infinite'
            }}></span>
          ) : (
            "Next Generation SocialFi Platform"
          )}
        </p>
        
        <p style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          {isLoading ? (
            <span style={{
              display: 'inline-block',
              height: '32px',
              width: '128px',
              background: 'rgba(180, 0, 255, 0.1)',
              borderRadius: '4px',
              animation: 'pulse 2s infinite'
            }}></span>
          ) : (
            "Built for creators, powered by fans"
          )}
        </p>
        
        <p style={{
          maxWidth: '800px',
          margin: '0 auto',
          color: 'var(--text-secondary)',
          fontSize: '18px'
        }}>
          {isLoading ? (
            <>
              <span style={{
                display: 'inline-block',
                height: '16px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'pulse 2s infinite'
              }}></span>
              <span style={{
                display: 'inline-block',
                height: '16px',
                width: '75%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                animation: 'pulse 2s infinite'
              }}></span>
            </>
          ) : (
            "Step into the future where creators and fans truly connect and earn"
          )}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;