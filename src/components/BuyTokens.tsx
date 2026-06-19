import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { getPresaleContract } from '../utils/PresaleContract';
import { PresaleData } from '../utils/PresaleContract';

const USDT_ABI = [
  "function approve(address spender, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)"
];

const BNBLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 2500 2500"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="1250" cy="1250" r="1250" fill="#F3BA2F" />
    <path
      fill="#FFFFFF"
      d="M1250 394 832 812l169 169 249-249 249 249 169-169L1250 394zm528 528-169 169 169 169 169-169-169-169zm-1056 0-169 169 169 169 169-169-169-169zm528 528-249-249-169 169 418 418 418-418-169-169-249 249zm0 208-249 249 249 249 249-249-249-249z"
    />
  </svg>
);

const USDTLogo = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 2500 2500"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="1250" cy="1250" r="1250" fill="#26A17B" />
    <path
      fill="#FFFFFF"
      d="M1411 1063v-165H1882V591H618v307h470v165c-299 14-525 74-525 146s226 132 525 146v553h323v-553c299-14 525-74 525-146s-226-132-525-146zm0 235c-25 2-151 9-411 9s-386-7-411-9c-89-7-152-27-152-52s63-45 152-52c25-2 151-9 411-9s386 7 411 9c89 7 152 27 152 52s-63 45-152 52z"
    />
  </svg>
);


const BuyTokens: React.FC<{ usdtAddress: string; tokenData: PresaleData }> = ({ usdtAddress, tokenData }) => {
  const { signer, walletAddress, isBSC, provider } = useWallet();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BNB' | 'USDT'>('BNB');
  const [tokenAmount, setTokenAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (amount && tokenData?.currentPrice) {
      const amountNum = parseFloat(amount);
      if (paymentMethod === 'BNB') {
        const bnbValueInUSD = amountNum * tokenData.bnbPrice;
        const calculatedTokens = bnbValueInUSD / tokenData.currentPrice;
        setTokenAmount(parseFloat(calculatedTokens.toFixed(6)));
      } else {
        const calculatedTokens = amountNum / tokenData.currentPrice;
        setTokenAmount(parseFloat(calculatedTokens.toFixed(6)));
      }
    } else {
      setTokenAmount(0);
    }
  }, [amount, paymentMethod, tokenData]);

  const parseError = (error: any): string => {
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      return 'Transaction was cancelled';
    }
    if (error.message?.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient balance for this transaction';
    }
    if (error.message?.includes('gas required exceeds allowance') ||
        error.message?.includes('transaction would fail')) {
      return 'Transaction would fail (check token availability)';
    }
    if (error.data?.message) {
      if (error.data.message.includes('Not enough tokens left')) {
        return 'Not enough tokens remaining for sale';
      }
      if (error.data.message.includes('Sale not active')) {
        return 'Token sale is not currently active';
      }
      if (error.data.message.includes('Minimum purchase amount')) {
        return 'Purchase amount is below minimum requirement';
      }
    }
    if (error.code === -32603) {
      return 'Transaction failed (contract may be paused or tokens sold out)';
    }
    return error.message || 'Transaction failed';
  };

  const handleBuyNow = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Please enter a valid amount");
      return;
    }
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }
    if (!isBSC) {
      setError("Please connect to Binance Smart Chain");
      return;
    }
    if (!signer) {
      setError("Wallet signer not available");
      return;
    }
    if (tokenData?.remaining !== undefined && tokenAmount > tokenData.remaining) {
      setError(`Not enough tokens remaining (${tokenData.remaining.toFixed(2)} available)`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);
      const contract = getPresaleContract(signer);
      
      if (paymentMethod === 'BNB') {
        const balance = await signer.getBalance();
        const requiredBalance = ethers.utils.parseEther(amount);
        if (balance.lt(requiredBalance)) {
          setError(`Insufficient BNB balance (need ${amount} BNB)`);
          return;
        }
        const gasPrice = await provider?.getGasPrice();
        const adjustedGasPrice = gasPrice?.mul(120).div(100);
        const tx = await contract.buyWithBNB({
          value: requiredBalance,
          gasPrice: adjustedGasPrice
        });
        setTxHash(tx.hash);
        await tx.wait();
      } else {
        const usdt = new ethers.Contract(usdtAddress, USDT_ABI, signer);
        const decimals = await usdt.decimals();
        const usdtAmount = ethers.utils.parseUnits(amount, decimals);
        const balance = await usdt.balanceOf(walletAddress);
        if (balance.lt(usdtAmount)) {
          setError(`Insufficient USDT balance (need ${amount} USDT)`);
          return;
        }
        const allowance = await usdt.allowance(walletAddress, contract.address);
        if (allowance.lt(usdtAmount)) {
          setIsApproving(true);
          const approveTx = await usdt.approve(contract.address, usdtAmount);
          await approveTx.wait();
          setIsApproving(false);
        }
        const tx = await contract.buyWithUSDT(usdtAmount);
        setTxHash(tx.hash);
        await tx.wait();
      }
      setAmount('');
    } catch (error: any) {
      console.error("Purchase error:", error);
      setError(parseError(error));
    } finally {
      setLoading(false);
      setIsApproving(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10, 20, 40, 0.8) 0%, rgba(5, 15, 30, 0.9) 100%)',
      color: 'white',
      padding: '28px',
      borderRadius: '16px',
      boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      backdropFilter: 'blur(8px)',
      fontFamily: '"Rajdhani", sans-serif',
      position: 'relative',
      overflow: 'hidden'
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

      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        textShadow: '0 0 10px rgba(0, 240, 255, 0.7)',
        fontFamily: '"Orbitron", sans-serif',
        letterSpacing: '1px'
      }}>
        <span style={{ 
          color: 'var(--neon-cyan)',
          filter: 'drop-shadow(0 0 8px var(--neon-cyan))'
        }}>🛒</span>
        <span style={{
          background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>BUY FansNgage TOKENS ($FANS)</span>
      </h3>

      <label
  style={{
    display: 'block',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '10px',
    letterSpacing: '1px',
    fontFamily: '"Orbitron", sans-serif',
    textTransform: 'uppercase'
  }}
>
  Select Payment Currency
</label>

      
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <button
          onClick={() => setPaymentMethod('BNB')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 0',
            borderRadius: '12px',
            border: paymentMethod === 'BNB' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
            background: paymentMethod === 'BNB' 
              ? 'rgba(243, 186, 47, 0.15)' 
              : 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            fontWeight: '600',
            color: paymentMethod === 'BNB' ? 'var(--neon-cyan)' : 'white',
            transition: 'all 0.3s ease',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: paymentMethod === 'BNB' ? '0 0 10px rgba(243, 186, 47, 0.5)' : 'none'
          }}
          aria-pressed={paymentMethod === 'BNB'}
        >
          <BNBLogo /> BNB
        </button>
           <button
          onClick={() => setPaymentMethod('USDT')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 0',
            borderRadius: '12px',
            border: paymentMethod === 'USDT' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
            background: paymentMethod === 'USDT' 
              ? 'rgba(38, 161, 123, 0.15)' 
              : 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            fontWeight: '600',
            color: paymentMethod === 'USDT' ? 'var(--neon-cyan)' : 'white',
            transition: 'all 0.3s ease',
            fontFamily: '"Orbitron", sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            boxShadow: paymentMethod === 'USDT' ? '0 0 10px rgba(38, 161, 123, 0.5)' : 'none'
          }}
          aria-pressed={paymentMethod === 'USDT'}
        >
          <USDTLogo /> USDT
        </button>

         </div>

      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '14px',
          background: 'rgba(255, 0, 102, 0.15)',
          color: 'var(--neon-pink)',
          borderRadius: '10px',
          fontSize: '14px',
          border: '1px solid var(--neon-pink)',
          textShadow: '0 0 8px var(--neon-pink)',
          fontFamily: '"Roboto Mono", monospace',
          animation: 'pulse 2s infinite'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '10px',
          letterSpacing: '1px',
          fontFamily: '"Orbitron", sans-serif',
          textTransform: 'uppercase'
        }}>
          Amount in {paymentMethod}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${isInputFocused ? 'var(--neon-cyan)' : 'rgba(0, 240, 255, 0.3)'}`,
            color: 'white',
            outline: 'none',
            fontSize: '16px',
            fontFamily: '"Roboto Mono", monospace',
            boxShadow: isInputFocused ? '0 0 10px var(--neon-cyan)' : 'none',
            transition: 'all 0.3s ease'
          }}
          placeholder={`Enter ${paymentMethod} amount`}
          min="0.0001"
          step="0.0001"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '10px',
          letterSpacing: '1px',
          fontFamily: '"Orbitron", sans-serif',
          textTransform: 'uppercase'
        }}>
          You will receive:
        </label>
        <div style={{
          padding: '14px',
          background: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          fontSize: '18px',
          fontFamily: '"Roboto Mono", monospace',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 0 8px var(--neon-cyan)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: 'var(--neon-cyan)' }}>➜</span>
          {tokenAmount.toLocaleString()} <span style={{ color: 'var(--neon-purple)' }}>FANS</span> Tokens
        </div>
      </div>


     
    
      <button
        onClick={handleBuyNow}
        disabled={loading || !amount || !walletAddress || !isBSC}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          fontWeight: 'bold',
          border: 'none',
          transition: 'all 0.3s',
          cursor: loading || !amount || !walletAddress || !isBSC ? 'not-allowed' : 'pointer',
          opacity: loading || !amount || !walletAddress || !isBSC ? 0.7 : 1,
          background: loading || !amount || !walletAddress || !isBSC
            ? 'rgba(128, 128, 128, 0.3)'
            : 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))',
          color: loading || !amount || !walletAddress || !isBSC ? 'white' : 'black',
          boxShadow: isHovered && !loading && amount && walletAddress && isBSC
            ? '0 0 20px var(--neon-cyan)'
            : 'none',
          fontSize: '16px',
          fontFamily: '"Orbitron", sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isApproving ? (
          'APPROVING USDT...'
        ) : loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{
              animation: 'spin 1s linear infinite',
              marginRight: '10px',
              width: '20px',
              height: '20px'
            }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PROCESSING...
          </span>
        ) : !isBSC ? (
          'SWITCH TO BSC NETWORK'
        ) : !walletAddress ? (
          'CONNECT WALLET TO BUY'
        ) : (
          `BUY WITH ${paymentMethod}`
        )}
        <span style={{
          position: 'absolute',
          top: '-50%',
          left: '-60%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(30deg)',
          transition: 'all 0.3s',
          opacity: isHovered && !loading && amount && walletAddress && isBSC ? 1 : 0
        }}></span>
      </button>

      {txHash && (
        <div style={{
          marginTop: '16px',
          fontSize: '14px',
          color: 'var(--neon-cyan)',
          textAlign: 'center',
          fontFamily: '"Roboto Mono", monospace'
        }}>
          ✅ Transaction submitted!{' '}
          <a
            href={`https://bscscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsLinkHovered(true)}
            onMouseLeave={() => setIsLinkHovered(false)}
            style={{
              color: isLinkHovered ? 'white' : 'var(--neon-cyan)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--neon-cyan)',
              transition: 'all 0.3s',
              fontWeight: '600'
            }}
          >
            View on BscScan
          </a>
        </div>
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
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default BuyTokens;