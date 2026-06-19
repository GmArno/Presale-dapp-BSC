import { ethers } from 'ethers';
import ABI from './abi.json';

const CONTRACT_ADDRESS = '0xbA440Cb5C9E7ae16B8BC5F33eB06e17e3715eaCe';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Export the interface
export interface PresaleData {
  currentPrice: number;
  nextRoundPrice: number;
  sold: number;
  forSale: number;
  remaining: number;
  raisedBNB: number;
  raisedUSDT: number;
  raisedTotal: number;
  totalBuyers: number;
  progress: number;
  usdtAddress: string;
  saleTokenAddress: string;
  bnbPrice: number;
}

export const getPresaleContract = (providerOrSigner: ethers.providers.Provider | ethers.Signer): ethers.Contract => {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
};

export const fetchPresaleData = async (providerOrSigner: ethers.providers.Provider | ethers.Signer): Promise<PresaleData> => {
  const contract = getPresaleContract(providerOrSigner);
  
  const [
    priceInUSD,
    totalTokensSold,
    remainingTokens,
    totalBNBReceived,
    totalUSDTReceived,
    totalBuyers,
    bnbPrice,
    totalTokensForSale,
    usdtAddress,
    saleTokenAddress,
    totalAmountRaised // Added this line to get the pre-calculated total from contract
  ] = await Promise.all([
    contract.priceInUSD(),
    contract.totalTokensSold(),
    contract.getRemainingTokens(),
    contract.totalBNBReceived(),
    contract.totalUSDTReceived(),
    contract.totalBuyers(),
    contract.getBNBPrice(),
    contract.totalTokensForSale(),
    contract.usdt(),
    contract.saleToken(),
    contract.getTotalAmountRaised() // Added this function call
  ]);

  // Conversion functions
  const fromWei = (value: ethers.BigNumber) => parseFloat(ethers.utils.formatEther(value));
  const fromUSDT = (value: ethers.BigNumber) => parseFloat(ethers.utils.formatUnits(value, 6));
  const fromPriceFeed = (value: ethers.BigNumber) => parseFloat(ethers.utils.formatUnits(value, 8));

  // Convert all values
  const currentPrice = fromWei(priceInUSD);
  const sold = fromWei(totalTokensSold);
  const forSale = fromWei(totalTokensForSale);
  const remaining = fromWei(remainingTokens);
  const raisedBNB = fromWei(totalBNBReceived);
  const raisedUSDT = fromUSDT(totalUSDTReceived);
  const bnbPriceFormatted = fromPriceFeed(bnbPrice);
  const totalRaisedUSD = fromWei(totalAmountRaised); // Use the contract's calculated total

  // Calculate derived values
  const progress = forSale > 0 ? (sold / forSale) * 100 : 0;

  return {
    currentPrice,
    nextRoundPrice: currentPrice * 1.2,
    sold,
    forSale,
    remaining,
    raisedBNB,
    raisedUSDT,
    raisedTotal: totalRaisedUSD, // Now using the contract's total amount
    totalBuyers: totalBuyers.toNumber(),
    progress,
    usdtAddress,
    saleTokenAddress,
    bnbPrice: bnbPriceFormatted
  };
};