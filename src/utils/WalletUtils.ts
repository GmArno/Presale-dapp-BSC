// src/utils/WalletUtils.ts
interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  isPopular?: boolean;
}

export const getAvailableWallets = (showAll = false): WalletInfo[] => {
  // Always visible popular wallets - ONLY MODIFY NON-WORKING ICONS
  const popularWallets: WalletInfo[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://cdn.iconscout.com/icon/free/png-512/metamask-2728406-2261817.png', // KEEP WORKING URL
      description: 'Browser extension & mobile app',
      isPopular: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: 'https://i.postimg.cc/2yN6DJMn/coinbasewalletc.png', // KEEP WORKING URL
      description: 'Exchange wallet',
      isPopular: true
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: 'https://trustwallet.com/assets/images/media/assets/TWT.png', // KEEP WORKING URL
      description: 'Mobile wallet',
      isPopular: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: 'https://i.postimg.cc/zDbYkVsH/walletconnecticon.jpg', // KEEP WORKING URL
      description: 'Connect with 450+ wallets',
      isPopular: true
    },
    {
      id: 'binance',
      name: 'Binance Chain',
      icon: 'https://bin.bnbstatic.com/static/images/common/favicon.ico', // KEEP WORKING URL
      description: 'Binance ecosystem wallet',
      isPopular: true
    }
  ];

  // Additional wallets - ONLY MODIFY NON-WORKING ICONS
  const additionalWallets: WalletInfo[] = [
    {
      id: 'argent',
      name: 'Argent',
      icon: 'https://i.postimg.cc/wjsjSHjf/id-Nob-Mdd7-B-logos.png', // UPDATED URL
      description: 'Smart contract wallet'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: 'https://i.postimg.cc/25Q8Swvn/id693-KTu-Df-logos.png', // KEEP ORIGINAL URL
      description: 'Beautiful wallet experience'
    },
    {
      id: 'tokenpocket',
      name: 'TokenPocket',
      icon: 'https://i.postimg.cc/dtGMzgtq/tokenpocketwallet.png', // KEEP ORIGINAL URL
      description: 'Multi-chain wallet'
    },
    {
      id: 'mathwallet',
      name: 'Math Wallet',
      icon: 'https://i.postimg.cc/d3wqXvPT/mathwallet.jpg', // KEEP ORIGINAL URL
      description: 'Multi-platform wallet'
    },
    {
      id: 'safepal',
      name: 'SafePal',
      icon: 'https://i.postimg.cc/NGmyKPCV/safepalwalletpng.png', // KEEP ORIGINAL URL
      description: 'Hardware & software wallet'
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: 'https://www.okx.com/favicon.ico', // KEEP ORIGINAL URL
      description: 'Exchange wallet'
    },
    {
      id: 'bitget',
      name: 'Bitget Wallet',
      icon: 'https://web3.bitget.com/favicon.ico', // KEEP ORIGINAL URL
      description: 'Multi-chain wallet'
    },
    {
      id: 'zerion',
      name: 'Zerion',
      icon: 'https://i.postimg.cc/4y3sQPRD/zerionwallet.png', // KEEP ORIGINAL URL
      description: 'DeFi wallet'
    },
    {
      id: 'imtoken',
      name: 'imToken',
      icon: 'https://i.postimg.cc/9X65gc28/imtokenwallet.jpg', // KEEP ORIGINAL URL
      description: 'Mobile wallet'
    },
    {
      id: 'coin98',
      name: 'Coin98',
      icon: 'https://coin98.com/favicon.ico', // KEEP ORIGINAL URL
      description: 'Super wallet'
    }
  ];

  return showAll ? [...popularWallets, ...additionalWallets] : popularWallets;
};

// Keep existing detection logic for compatibility
export const detectInstalledWallets = (): WalletInfo[] => {
  return getAvailableWallets(true);
};