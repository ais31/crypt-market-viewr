import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import CryptoPriceTable from './components/CryptoPriceTable';
import { fetchCryptoPrices } from './services/cryptoService';
import { CryptoPrice } from './types/crypto';

const SYMBOLS = ['XRP', 'DOGE', 'AIXBT'];
const UPDATE_INTERVAL = 5000; // 5秒

function App() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updatePrices = async () => {
      try {
        const newPrices = await fetchCryptoPrices(SYMBOLS);
        setPrices(newPrices);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('価格の取得に失敗しました:', error);
      }
    };

    // 初回実行
    updatePrices();

    // 定期更新の設定
    const interval = setInterval(updatePrices, UPDATE_INTERVAL);

    // クリーンアップ
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          仮想通貨需給モニター
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          最終更新: {lastUpdate.toLocaleString()}
        </Typography>
        <CryptoPriceTable prices={prices} />
      </Box>
    </Container>
  );
}

export default App;
