// src/index.tsx
// Add this as the FIRST line in your index.tsx
import './utils/walletConnectPolyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global.css'; // Add this line to import global styles
import App from './App';
import reportWebVitals from './reportWebVitals';
import { WalletProvider } from './context/WalletContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);

reportWebVitals();