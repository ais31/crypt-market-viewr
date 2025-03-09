import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { CryptoPrice } from '../types/crypto';

interface Props {
  prices: CryptoPrice[];
}

const formatNumber = (num: number | undefined, exchange: string, decimals: number = 4): string => {
  if (num === undefined) return 'N/A';
  const value = num.toFixed(decimals);
  return exchange === 'upbit' ? `${value} KRW` : `${value} USDT`;
};

const formatPercentage = (num: number | undefined): string => {
  if (num === undefined) return 'N/A';
  return `${num.toFixed(4)}%`;
};

const CryptoPriceTable: React.FC<Props> = ({ prices }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>通貨</TableCell>
            <TableCell>取引所</TableCell>
            <TableCell align="right">現物価格</TableCell>
            <TableCell align="right">先物価格</TableCell>
            <TableCell align="right">価格差(%)</TableCell>
            <TableCell align="right">FR(%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prices.map((price) => (
            <React.Fragment key={price.symbol}>
              {['bybit', 'binance', 'bitget', 'upbit'].map((exchange, index) => (
                <TableRow key={`${price.symbol}-${exchange}`}>
                  {index === 0 && (
                    <TableCell rowSpan={4}>
                      <Typography variant="body1" fontWeight="bold">
                        {price.symbol}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2" textTransform="capitalize">
                      {exchange}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(price.spotPrice[exchange as keyof typeof price.spotPrice], exchange)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(price.futuresPrice[exchange as keyof typeof price.futuresPrice], exchange)}
                  </TableCell>
                  <TableCell align="right">
                    {formatPercentage(price.priceDifference[exchange as keyof typeof price.priceDifference])}
                  </TableCell>
                  <TableCell align="right">
                    {formatPercentage(price.fundingRate[exchange as keyof typeof price.fundingRate])}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CryptoPriceTable;
