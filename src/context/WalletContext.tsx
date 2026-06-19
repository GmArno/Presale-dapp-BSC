import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3Modal from 'web3modal';
import '../utils/walletConnectPolyfill';
import { getWalletInstallLink } from '../utils/walletLinks';

// Create a separate type definition file (wallet-types.d.ts) in your src folder
// with the following content:
/*
declare global {
  interface Window {
    ethereum?: any;
    BinanceChain?: any;
    trustwallet?: any;
    coinbaseWalletExtension?: any;
  }
}
*/

interface WalletContextType {
  walletAddress: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isBSC: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BSC_RPCS = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/'
];

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBSC, setIsBSC] = useState(false);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);
  const disconnectWalletRef = useRef<() => void>(() => {});

  const switchToBSC = useCallback(async (providerInstance: any) => {
    try {
      await providerInstance.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'Binance Smart Chain Mainnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: BSC_RPCS,
          blockExplorerUrls: ['https://bscscan.com']
        }]
      });
      return true;
    } catch (err) {
      console.error("Failed to switch network:", err);
      setError("Please manually switch to Binance Smart Chain in your wallet");
      return false;
    }
  }, []);

  const checkNetwork = useCallback(async (providerInstance: ethers.providers.Web3Provider) => {
    try {
      const network = await providerInstance.getNetwork();
      return network.chainId === 56;
    } catch (err) {
      console.error("Network check failed:", err);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    setWalletAddress(null);
    setProvider(null);
    setSigner(null);
    setIsBSC(false);
    setError(null);
  }, [web3Modal]);

  useEffect(() => {
    disconnectWalletRef.current = disconnectWallet;
  }, [disconnectWallet]);

  const connectWallet = useCallback(async (walletId?: string) => {
    if (!web3Modal) {
      setError("Wallet connection not initialized");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      
      let instance;
      
      switch (walletId) {
        case 'walletconnect':
          instance = await web3Modal.connectTo('walletconnect');
          break;

        case 'coinbase':
          if ((window as any).ethereum?.isCoinbaseWallet || (window as any).coinbaseWalletExtension) {
            instance = await web3Modal.connectTo('coinbasewallet');
          } else {
            throw new Error(`Coinbase Wallet not detected. Install it: ${getWalletInstallLink('coinbase')}`);
          }
          break;

        case 'binance':
          if ((window as any).BinanceChain) {
            instance = (window as any).BinanceChain;
          } else {
            throw new Error(`Binance Chain Wallet not detected. Install it: ${getWalletInstallLink('binance')}`);
          }
          break;

        case 'trust':
          if ((window as any).ethereum?.isTrust || (window as any).trustwallet) {
            instance = await web3Modal.connectTo('injected');
          } else {
            throw new Error(`Trust Wallet not detected. Install it: ${getWalletInstallLink('trust')}`);
          }
          break;

        case 'argent':
        case 'rainbow':
        case 'tokenpocket':
        case 'mathwallet':
        case 'safepal':
        case 'okx':
        case 'bitget':
        case 'zerion':
        case 'imtoken':
        case 'coin98':
          if ((window as any).ethereum) {
            instance = await web3Modal.connectTo('injected');
          } else {
            throw new Error(`${walletId} not detected. Install it: ${getWalletInstallLink(walletId)}`);
          }
          break;

        case 'metamask':
        default:
          if ((window as any).ethereum) {
            instance = await web3Modal.connectTo('injected');
          } else {
            throw new Error(`MetaMask not detected. Install it: ${getWalletInstallLink('metamask')}`);
          }
      }

      if (instance.provider?.isCoinbaseWallet || instance.isCoinbaseWallet) {
        instance.send = instance.send || instance.provider?.request || instance.request;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const providerInstance = new ethers.providers.Web3Provider(instance);
      let networkValid = await checkNetwork(providerInstance);
      
      if (!networkValid) {
        networkValid = await switchToBSC(instance);
        if (!networkValid) return;
      }

      const signerInstance = providerInstance.getSigner();
      const address = await signerInstance.getAddress();
      const network = await providerInstance.getNetwork();

      setWalletAddress(address);
      setProvider(providerInstance);
      setSigner(signerInstance);
      setIsBSC(network.chainId === 56);

      instance.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWalletRef.current();
        } else {
          setWalletAddress(accounts[0]);
        }
      });

      instance.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setIsBSC(newChainId === 56);
        setError(newChainId !== 56 ? "Please switch to Binance Smart Chain" : null);
      });

      instance.on('disconnect', () => {
        disconnectWalletRef.current();
      });

    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [web3Modal, checkNetwork, switchToBSC]);

  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          projectId: 'dfc48d62a85b7e241cf52b0486eba79b',
          rpc: {
            56: 'https://bsc-dataseed.binance.org/',
            1: 'https://cloudflare-eth.com'
          },
          qrcodeModalOptions: {
            mobileLinks: [
              'metamask',
              'trust',
              'rainbow',
              'argent',
              'imtoken',
              'pillar',
              'bitkeep',
              'zerion',
              'tokenpocket',
              'mathwallet',
              'safepal',
              'onto',
              'coin98',
              'okx',
              'bitget'
            ]
          }
        }
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: "Presale DApp",
          rpcUrl: 'https://bsc-dataseed.binance.org/',
          chainId: 56,
          darkMode: true
        }
      },
      binancechainwallet: {
        package: true,
        options: {
          chainId: 56,
          rpcUrl: 'https://bsc-dataseed.binance.org/'
        }
      }
    };

    const modal = new Web3Modal({
      cacheProvider: true,
      providerOptions,
      theme: {
        background: '#1e293b',
        main: '#ffffff',
        secondary: '#94a3b8',
        border: '#334155',
        hover: '#0f172a'
      },
      disableInjectedProvider: false
    });

    setWeb3Modal(modal);

    return () => {
      if (modal.cachedProvider) {
        modal.clearCachedProvider();
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      provider,
      signer,
      isBSC,
      isConnecting,
      error,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;