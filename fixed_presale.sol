// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IERC20Metadata is IERC20 {
    function decimals() external view returns (uint8);
}

contract TokenSale is Ownable {
    IERC20 public saleToken;
    IERC20 public usdt;
    AggregatorV3Interface public priceFeed;

    uint256 public totalTokensForSale;
    uint256 public priceInUSD; // 18 decimals

    uint256 public totalTokensSold;
    uint256 public totalUSDTReceived;
    uint256 public totalBNBReceived;

    mapping(address => bool) public hasPurchased;
    uint256 public totalBuyers;

    bool public salePaused;

    constructor(address _saleToken) Ownable(msg.sender) {
        saleToken = IERC20(_saleToken);
        usdt = IERC20(0x55d398326f99059fF775485246999027B3197955); // USDT on BSC
        priceFeed = AggregatorV3Interface(0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE); // BNB/USD
    }

    function updatePrice(uint256 _priceInUSD) external onlyOwner {
        priceInUSD = _priceInUSD;
    }

    function pauseSale() external onlyOwner {
        salePaused = true;
    }

    function resumeSale() external onlyOwner {
        salePaused = false;
    }

    function depositTokens(uint256 amount) external onlyOwner {
        saleToken.transferFrom(msg.sender, address(this), amount);
        totalTokensForSale += amount;
    }

    function buyWithUSDT(uint256 usdtAmount) external {
        require(!salePaused, "Sale is paused");
        require(priceInUSD > 0, "Price not set");

        uint256 tokenAmount = (usdtAmount * 1e18) / priceInUSD;
        require(tokenAmount <= getRemainingTokens(), "Not enough tokens left");

        require(usdt.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        saleToken.transfer(msg.sender, tokenAmount);

        totalUSDTReceived += usdtAmount;
        totalTokensSold += tokenAmount;

        if (!hasPurchased[msg.sender]) {
            hasPurchased[msg.sender] = true;
            totalBuyers++;
        }
    }

    function buyWithBNB() external payable {
        require(!salePaused, "Sale is paused");
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

    function getBNBPrice() public view returns (uint256) {
        (, int price,,,) = priceFeed.latestRoundData();
        return uint256(price); // 8 decimals
    }
    function getTokenPriceInBNB() public view returns (uint256) {
    require(priceInUSD > 0, "Price not set");
    uint256 bnbUsd = getBNBPrice(); // 8 decimals from Chainlink

    // Convert token price (USD) into BNB with 18 decimals
    // Formula: (priceInUSD / (bnbUsd * 1e10)) * 1e18
    // Because priceInUSD = 1e18 decimals, bnbUsd = 1e8 decimals
    uint256 tokenPriceInBNB = (priceInUSD * 1e8) / bnbUsd;

    return tokenPriceInBNB; // 18 decimals
}


    function getRemainingTokens() public view returns (uint256) {
        return saleToken.balanceOf(address(this));
    }

    function getTotalAmountRaised() public view returns (uint256) {
        uint256 bnbUsd = getBNBPrice();
        uint256 bnbInUsd = (totalBNBReceived * bnbUsd) / 1e8;
        return bnbInUsd + totalUSDTReceived;
    }

    function withdrawTokens(address token) external onlyOwner {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
