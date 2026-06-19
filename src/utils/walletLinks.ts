// src/utils/walletLinks.ts
export const getWalletInstallLink = (walletId: string): string => {
  const walletLinks: Record<string, string> = {
    metamask: 'https://metamask.io/download',
    coinbase: 'https://www.coinbase.com/wallet/downloads',
    trust: 'https://trustwallet.com/download',
    binance: 'https://www.bnbchain.org/wallet',
    argent: 'https://www.argent.xyz/',
    rainbow: 'https://rainbow.me/',
    tokenpocket: 'https://www.tokenpocket.pro/',
    mathwallet: 'https://mathwallet.org/',
    safepal: 'https://www.safepal.com/download',
    okx: 'https://www.okx.com/web3',
    bitget: 'https://web3.bitget.com/',
    zerion: 'https://zerion.io/',
    imtoken: 'https://token.im/',
    coin98: 'https://coin98.com/wallet',
    // WalletConnect doesn't need installation
    walletconnect: 'https://walletconnect.com/'
  };

  return walletLinks[walletId] || 'https://ethereum.org/en/wallets/find-wallet/';
};

export const getWalletErrorInstallMessage = (walletId: string): string => {
  return `${walletId.charAt(0).toUpperCase() + walletId.slice(1)} not detected. Please install it first.`;
};