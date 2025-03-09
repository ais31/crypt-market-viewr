export interface CryptoPrice {
  symbol: string;
  spotPrice: {
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
    dex?: number;
  };
  futuresPrice: {
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  priceDifference: {
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  fundingRate: {
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  timestamp: number;
}
