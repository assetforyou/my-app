// Real-time Price Updates
// Stub service for integrating with market data APIs

const PriceUpdateService = {
  // Stub: fetch real-time stock price
  fetchStockPrice: async (symbol) => {
    // In production, call Finnhub / Alpha Vantage / Polygon.io
    // Example: const api = process.env.REACT_APP_FINNHUB_API_KEY;
    // For now, return mock data
    const mockPrices = {
      AAPL: 195.5,
      GOOGL: 140.3,
      MSFT: 420.1,
      TSLA: 245.8,
      NVDA: 875.2,
    };
    return mockPrices[symbol] || null;
  },

  // Stub: fetch crypto price
  fetchCryptoPrice: async (symbol) => {
    // In production, call CoinGecko or Kraken API
    const mockPrices = {
      BTC: 42500,
      ETH: 2250,
      SOL: 85,
      ADA: 0.95,
    };
    return mockPrices[symbol] || null;
  },

  // Stub: fetch commodity price
  fetchCommodityPrice: async (commodity) => {
    // In production, call FRED or World Bank API
    const mockPrices = {
      GOLD: 1950,
      SILVER: 28.5,
      OIL: 78.2,
    };
    return mockPrices[commodity] || null;
  },

  // Batch update prices for portfolio
  updatePortfolioPrices: async (assets) => {
    // Return assets with updated prices
    const updated = [];
    for (const asset of assets) {
      let price = null;
      if (asset.type === 'stock') {
        price = await PriceUpdateService.fetchStockPrice(asset.symbol);
      } else if (asset.type === 'crypto') {
        price = await PriceUpdateService.fetchCryptoPrice(asset.symbol);
      }
      updated.push({ ...asset, price: price || asset.price });
    }
    return updated;
  },

  // Detect price changes (for alerts)
  detectPriceChanges: (oldPrices, newPrices) => {
    const changes = [];
    newPrices.forEach((newPrice) => {
      const oldPrice = oldPrices.find((p) => p.id === newPrice.id);
      if (oldPrice && oldPrice.price && newPrice.price) {
        const changePercent = ((newPrice.price - oldPrice.price) / oldPrice.price) * 100;
        if (Math.abs(changePercent) >= 5) {
          // Alert if >5% change
          changes.push({
            asset: newPrice.name,
            oldPrice: oldPrice.price,
            newPrice: newPrice.price,
            changePercent: changePercent.toFixed(2),
            direction: changePercent > 0 ? 'up' : 'down',
          });
        }
      }
    });
    return changes;
  },
};

export default PriceUpdateService;
