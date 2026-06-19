// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "./context/WalletContext";
import { fetchPresaleData } from "./utils/PresaleContract";
import { ethers } from "ethers";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import TokenSaleInfo from "./components/TokenSaleInfo";
import ProgressBar from "./components/ProgressBar";
import BuyTokens from "./components/BuyTokens";
import FooterNote from "./components/FooterNote";
import WalletModal from "./components/WalletModal";

const App: React.FC = () => {
  const { provider, walletAddress } = useWallet();
  const [tokenData, setTokenData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const bscProvider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org/"
  );

  const loadData = useCallback(async () => {
    try {
      setDataLoading(true);
      setDataError(null);
      const currentProvider = provider || bscProvider;
      const data = await fetchPresaleData(currentProvider);
      setTokenData(data);
    } catch (err: any) {
      console.error("Failed to load presale data:", err);
      setDataError(err.message);
    } finally {
      setDataLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (dataLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            border: "4px solid rgba(0, 0, 0, 0.1)",
            borderLeftColor: "#00FFC2",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "16px" }}>Loading presale data...</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#FF0066", marginBottom: "16px" }}>
          Data Loading Error
        </h1>
        <p style={{ color: "white", marginBottom: "24px" }}>{dataError}</p>
        <button
          onClick={loadData}
          style={{
            padding: "12px 24px",
            background: "#00FFC2",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s",
            boxShadow: isHovered ? "0 0 15px #00FFC2" : "none",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
      }}
    >
      <Header />
      <HeroSection tokenName="FansNgage" />

      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {tokenData ? (
          <>
            <TokenSaleInfo tokenData={tokenData} />
           <ProgressBar
  progress={tokenData.progress} // Already calculated in fetchPresaleData
  currentPrice={tokenData.currentPrice}
  raisedTotal={tokenData.raisedTotal} // Already calculated in fetchPresaleData
  isLoading={dataLoading}
/>

            <BuyTokens
              usdtAddress={tokenData.usdtAddress}
              tokenData={tokenData}
            />

            {!walletAddress && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "40px 0",
                }}
              >
                <button
                  onClick={() => setShowWalletModal(true)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    padding: "16px 32px",
                    background: "linear-gradient(to right, #00FFC2, #0088FF)",
                    border: "none",
                    borderRadius: "8px",
                    color: "black",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                    boxShadow: isHovered
                      ? "0 0 20px rgba(0, 255, 194, 0.7)"
                      : "none",
                    transform: isHovered ? "translateY(-2px)" : "none",
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "white",
            }}
          >
            No presale data available
          </div>
        )}
      </main>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />

      <FooterNote />
    </div>
  );
};

export default App;
