// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenSale is Ownable {
    IERC20 public saleToken;
    IERC20 public usdt;

    AggregatorV3Interface public priceFeed;

    uint256 public totalTokensForSale;
    uint256 public priceInUSD; // in 18 decimals (e.g. 0.01 USD = 1e16)

    uint256 public totalTokensSold;
    uint256 public totalUSDTReceived;
    uint256 public totalBNBReceived;

    mapping(address => bool) public hasPurchased;
    uint256 public totalBuyers;

    constructor(address _saleToken) Ownable(msg.sender) {
        saleToken = IERC20(_saleToken);
        usdt = IERC20(0x55d398326f99059fF775485246999027B3197955); // USDT (BSC mainnet)
        priceFeed = AggregatorV3Interface(0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
); // BNB/USD
    }

    // Owner sets token price (USD with 18 decimals)
    function updatePrice(uint256 _priceInUSD) external onlyOwner {
        priceInUSD = _priceInUSD;
    }

    // Buy tokens with USDT
    function buyWithUSDT(uint256 usdtAmount) external {
        require(priceInUSD > 0, "Price not set");

        uint256 tokenAmount = (usdtAmount * 1e18) / priceInUSD;

        require(tokenAmount <= getRemainingTokens(), "Not enough tokens left");

        usdt.transferFrom(msg.sender, address(this), usdtAmount);
        saleToken.transfer(msg.sender, tokenAmount);

        totalUSDTReceived += usdtAmount;
        totalTokensSold += tokenAmount;

        if (!hasPurchased[msg.sender]) {
            hasPurchased[msg.sender] = true;
            totalBuyers++;
        }
    }

    // Buy tokens with BNB
    function buyWithBNB() external payable {
        require(priceInUSD > 0, "Price not set");

        uint256 bnbUsd = getBNBPrice();
        uint256 bnbAmountInUsd = (msg.value * bnbUsd) / 1e8;

        uint256 tokenAmount = (bnbAmountInUsd * 1e18) / priceInUSD;

        require(tokenAmount <= getRemainingTokens(), "Not enough tokens left");

        saleToken.transfer(msg.sender, tokenAmount);

        totalBNBReceived += msg.value;
        totalTokensSold += tokenAmount;

        if (!hasPurchased[msg.sender]) {
            hasPurchased[msg.sender] = true;
            totalBuyers++;
        }
    }

    // GETTERS

    function getTotalTokensSold() external view returns (uint256) {
        return totalTokensSold;
    }

    function getTotalBuyers() external view returns (uint256) {
        return totalBuyers;
    }

    function getRemainingTokens() public view returns (uint256) {
        return saleToken.balanceOf(address(this));
    }

    function getBNBPrice() public view returns (uint256) {
        (, int price,,,) = priceFeed.latestRoundData();
        return uint256(price); // 8 decimals
    }

    function getTotalAmountRaised() public view returns (uint256) {
        uint256 bnbUsd = getBNBPrice();
        uint256 bnbInUsd = (totalBNBReceived * bnbUsd) / 1e8;

        uint256 usdtInUsd = totalUSDTReceived; // USDT = 1 USD

        return bnbInUsd + usdtInUsd;
    }

    // Emergency: withdraw tokens or BNB
    function withdrawTokens(address token) external onlyOwner {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
