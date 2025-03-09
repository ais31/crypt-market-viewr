import axios from 'axios';
import { CryptoPrice } from '../types/crypto';

// 取引所APIのベースURL
const BYBIT_API = 'https://api.bybit.com/v5';
const BINANCE_SPOT_API = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES_API = 'https://fapi.binance.com';
const BITGET_API = 'https://api.bitget.com';
const UPBIT_API = 'https://api.upbit.com/v1';

// APIクライアントのデフォルトヘッダー設定
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 通貨ペアのマッピング
const SYMBOL_MAPPING = {
  XRP: {
    bybit: 'XRPUSDT',
    binance: 'XRPUSDT',
    bitget: 'XRP',
    upbit: 'KRW-XRP',
  },
  DOGE: {
    bybit: 'DOGEUSDT',
    binance: 'DOGEUSDT',
    bitget: 'DOGE',
    upbit: 'KRW-DOGE',
  },
  AIXBT: {
    bybit: 'AIXBTUSDT',
    binance: 'AIXBTUSDT',
    bitget: 'AIXBT',
    upbit: 'KRW-AIXBT',
  },
};

// APIクライアントの作成
const bybitClient = axios.create({ 
  baseURL: BYBIT_API,
  headers: defaultHeaders,
  timeout: 5000
});

const binanceSpotClient = axios.create({ 
  baseURL: BINANCE_SPOT_API,
  headers: defaultHeaders,
  timeout: 5000
});

const binanceFuturesClient = axios.create({ 
  baseURL: BINANCE_FUTURES_API,
  headers: defaultHeaders,
  timeout: 5000
});

const bitgetClient = axios.create({ 
  baseURL: BITGET_API,
  headers: defaultHeaders,
  timeout: 5000
});

const upbitClient = axios.create({ 
  baseURL: UPBIT_API,
  headers: defaultHeaders,
  timeout: 5000
});

// Bybitから価格を取得
async function getBybitPrices(symbol: string) {
  try {
    const symbolPair = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.bybit;
    if (!symbolPair) return null;

    const [spotRes, futuresRes] = await Promise.all([
      bybitClient.get(`/market/tickers?category=spot&symbol=${symbolPair}`),
      bybitClient.get(`/market/tickers?category=linear&symbol=${symbolPair}`),
    ]);

    const spotPrice = parseFloat(spotRes.data.result.list[0]?.lastPrice) || 0;
    const futuresPrice = parseFloat(futuresRes.data.result.list[0]?.lastPrice) || 0;
    const fundingRate = parseFloat(futuresRes.data.result.list[0]?.fundingRate) * 100 || 0;

    return { spotPrice, futuresPrice, fundingRate };
  } catch (error) {
    console.error('Bybit API error:', error);
    return null;
  }
}

// Binanceから価格を取得
async function getBinancePrices(symbol: string) {
  try {
    const symbolPair = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.binance;
    if (!symbolPair) return null;

    const [spotRes, futuresRes, fundingRes] = await Promise.all([
      binanceSpotClient.get(`/ticker/price?symbol=${symbolPair}`),
      binanceFuturesClient.get(`/fapi/v1/ticker/price?symbol=${symbolPair}`),
      binanceFuturesClient.get(`/fapi/v1/fundingRate?symbol=${symbolPair}`),
    ]);

    const spotPrice = parseFloat(spotRes.data.price) || 0;
    const futuresPrice = parseFloat(futuresRes.data.price) || 0;
    const fundingRate = parseFloat(fundingRes.data.fundingRate) * 100 || 0;

    return { spotPrice, futuresPrice, fundingRate };
  } catch (error) {
    console.error('Binance API error:', error);
    return null;
  }
}

// Bitgetから価格を取得
async function getBitgetPrices(symbol: string) {
  try {
    const symbolPair = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.bitget;
    if (!symbolPair) return null;

    console.log(`Fetching Bitget prices for ${symbolPair}`);

    const [spotRes, futuresRes, fundingRes] = await Promise.all([
      bitgetClient.get(`/api/spot/v1/market/ticker?symbol=${symbolPair}USDT`),
      bitgetClient.get(`/api/mix/v1/market/ticker?symbol=${symbolPair}USDT_UMCBL`),
      bitgetClient.get(`/api/mix/v1/market/current-fundrate?symbol=${symbolPair}USDT_UMCBL`),
    ]);

    console.log('Bitget Responses:', {
      spot: spotRes.data,
      futures: futuresRes.data,
      funding: fundingRes.data
    });

    const spotPrice = parseFloat(spotRes.data.data?.last) || 0;
    const futuresPrice = parseFloat(futuresRes.data.data?.last) || 0;
    const fundingRate = parseFloat(fundingRes.data.data?.fundingRate) * 100 || 0;

    return { spotPrice, futuresPrice, fundingRate };
  } catch (error) {
    console.error('Bitget API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Bitget API Response:', error.response?.data);
    }
    return null;
  }
}

// Upbitから価格を取得
async function getUpbitPrices(symbol: string) {
  try {
    const symbolPair = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.upbit;
    if (!symbolPair) return null;

    const response = await upbitClient.get(`/ticker?markets=${symbolPair}`);
    const spotPrice = parseFloat(response.data[0]?.trade_price) || 0;

    return { 
      spotPrice,
      futuresPrice: 0,
      fundingRate: 0
    };
  } catch (error) {
    console.error('Upbit API error:', error);
    return null;
  }
}

// 価格差を計算
function calculatePriceDifference(spot: number | undefined | null, futures: number | undefined | null): number {
  if (!spot || !futures) return 0;
  return ((futures - spot) / spot) * 100;
}

// メイン関数
export const fetchCryptoPrices = async (symbols: string[]): Promise<CryptoPrice[]> => {
  const prices: CryptoPrice[] = [];

  for (const symbol of symbols) {
    try {
      const [bybit, binance, bitget, upbit] = await Promise.all([
        getBybitPrices(symbol),
        getBinancePrices(symbol),
        getBitgetPrices(symbol),
        getUpbitPrices(symbol),
      ]);

      const price: CryptoPrice = {
        symbol,
        spotPrice: {
          bybit: bybit?.spotPrice ?? 0,
          binance: binance?.spotPrice ?? 0,
          bitget: bitget?.spotPrice ?? 0,
          upbit: upbit?.spotPrice ?? 0,
        },
        futuresPrice: {
          bybit: bybit?.futuresPrice ?? 0,
          binance: binance?.futuresPrice ?? 0,
          bitget: bitget?.futuresPrice ?? 0,
          upbit: 0,
        },
        priceDifference: {
          bybit: calculatePriceDifference(bybit?.spotPrice, bybit?.futuresPrice),
          binance: calculatePriceDifference(binance?.spotPrice, binance?.futuresPrice),
          bitget: calculatePriceDifference(bitget?.spotPrice, bitget?.futuresPrice),
          upbit: 0,
        },
        fundingRate: {
          bybit: bybit?.fundingRate ?? 0,
          binance: binance?.fundingRate ?? 0,
          bitget: bitget?.fundingRate ?? 0,
          upbit: 0,
        },
        timestamp: Date.now(),
      };

      prices.push(price);
    } catch (error) {
      console.error(`Error fetching prices for ${symbol}:`, error);
    }
  }

  return prices;
};
