import React, { Component, ReactNode } from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletConnectErrorBoundary extends Component<{children: ReactNode}, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('WalletConnect Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'var(--neon-pink)', padding: '16px' }}>
          WalletConnect encountered an error. Please try MetaMask instead.
        </div>
      );
    }

    return this.props.children;
  }
}