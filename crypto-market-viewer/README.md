# 仮想通貨需給モニター

複数の取引所から仮想通貨の現物価格、先物価格、Funding Rate（FR）を取得し、需給状況をリアルタイムで表示するWebアプリケーション。

## プロジェクト構造

```
crypto-market-viewer/
├── docker-compose.yml    # Dockerコンテナの設定
├── Dockerfile           # Dockerイメージのビルド設定
├── package.json        # プロジェクトの依存関係と設定
├── tsconfig.json       # TypeScript設定
├── public/            # 静的ファイル
│   └── index.html    # メインのHTMLファイル
└── src/              # ソースコード
    ├── App.tsx       # メインのアプリケーションコンポーネント
    ├── index.tsx     # アプリケーションのエントリーポイント
    ├── components/   # Reactコンポーネント
    │   └── CryptoPriceTable.tsx  # 価格表示用テーブルコンポーネント
    ├── services/     # ビジネスロジック
    │   └── cryptoService.ts      # 取引所APIとの通信処理
    └── types/        # 型定義
        └── crypto.ts             # データ型の定義
```

## 主要ファイルの説明

### 1. src/types/crypto.ts
アプリケーション全体で使用する型定義。

```typescript
export interface CryptoPrice {
  symbol: string;  // 通貨ペア（例：XRP, DOGE, AIXBT）
  spotPrice: {     // 現物価格
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  futuresPrice: {  // 先物価格
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  priceDifference: { // 価格差（%）
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  fundingRate: {    // FR（%）
    bybit?: number;
    binance?: number;
    bitget?: number;
    upbit?: number;
  };
  timestamp: number; // データ取得時刻
}
```

### 2. src/services/cryptoService.ts
取引所APIとの通信を担当するサービス。

```typescript
// 取引所APIのベースURL設定
const BYBIT_API = 'https://api.bybit.com/v5';
const BINANCE_SPOT_API = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES_API = 'https://fapi.binance.com';
const BITGET_API = 'https://api.bitget.com';
const UPBIT_API = 'https://api.upbit.com/v1';

// 通貨ペアのマッピング
const SYMBOL_MAPPING = {
  XRP: {
    bybit: 'XRPUSDT',
    binance: 'XRPUSDT',
    bitget: 'XRP',
    upbit: 'KRW-XRP',
  },
  // ... 他の通貨ペア
};

// 価格取得の例（Bybit）
async function getBybitPrices(symbol: string) {
  try {
    const [spotRes, futuresRes] = await Promise.all([
      bybitClient.get(`/market/tickers?category=spot&symbol=${symbolPair}`),
      bybitClient.get(`/market/tickers?category=linear&symbol=${symbolPair}`),
    ]);
    // レスポンスの解析と整形
    return { spotPrice, futuresPrice, fundingRate };
  } catch (error) {
    console.error('Bybit API error:', error);
    return null;
  }
}
```

### 3. src/components/CryptoPriceTable.tsx
価格データを表形式で表示するコンポーネント。

```typescript
const CryptoPriceTable: React.FC<Props> = ({ prices }) => {
  // 数値フォーマット関数
  const formatNumber = (num: number | undefined, exchange: string): string => {
    if (num === undefined) return 'N/A';
    const value = num.toFixed(4);
    return exchange === 'upbit' ? `${value} KRW` : `${value} USDT`;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>通貨</TableCell>
            <TableCell>取引所</TableCell>
            <TableCell>現物価格</TableCell>
            <TableCell>先物価格</TableCell>
            <TableCell>価格差(%)</TableCell>
            <TableCell>FR(%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prices.map((price) => (
            <React.Fragment key={price.symbol}>
              {['bybit', 'binance', 'bitget', 'upbit'].map((exchange, index) => (
                <TableRow key={`${price.symbol}-${exchange}`}>
                  {/* 価格データの表示 */}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

### 4. src/App.tsx
メインのアプリケーションコンポーネント。

```typescript
function App() {
  // 状態管理
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 定期更新処理
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

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Typography variant="h4">仮想通貨需給モニター</Typography>
      <Typography>最終更新: {lastUpdate.toLocaleString()}</Typography>
      <CryptoPriceTable prices={prices} />
    </Container>
  );
}
```

## 開発環境のセットアップ

1. 必要なソフトウェア:
   - Docker Desktop
   - Git

2. セットアップ手順:
```bash
# リポジトリのクローン
git clone <repository-url>
cd crypto-market-viewer

# 開発環境の起動
docker-compose up --build

# ブラウザでアクセス
open http://localhost:3000
```

## 取引所APIの詳細

### 1. Bybit API (v5)
- ベースURL: `https://api.bybit.com/v5`
- レート制限: 120リクエスト/分
- エンドポイント:
  ```
  /market/tickers?category=spot      # 現物価格
  /market/tickers?category=linear    # 先物価格（含むFR）
  ```

### 2. Binance API
- 現物API: `https://api.binance.com/api/v3`
- 先物API: `https://fapi.binance.com`
- エンドポイント:
  ```
  /ticker/price          # 現物価格
  /fapi/v1/ticker/price  # 先物価格
  /fapi/v1/fundingRate  # FR
  ```

### 3. Bitget API
- ベースURL: `https://api.bitget.com`
- エンドポイント:
  ```
  /api/spot/v1/market/ticker      # 現物価格
  /api/mix/v1/market/ticker       # 先物価格
  /api/mix/v1/market/current-fundrate  # FR
  ```

### 4. Upbit API
- ベースURL: `https://api.upbit.com/v1`
- エンドポイント:
  ```
  /ticker?markets=KRW-BTC  # 現物価格（KRWペア）
  ```

## エラーハンドリング

```typescript
// API通信エラーの処理
try {
  const response = await apiClient.get(endpoint);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API Response:', error.response?.data);
  }
  return null;
}

// リトライロジック
async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}
```

## パフォーマンス最適化

1. メモ化によるレンダリング最適化
```typescript
const CryptoPriceTable = React.memo<Props>(({ prices }) => {
  const formatNumber = useMemo(() => 
    (num: number | undefined, exchange: string): string => {
      if (num === undefined) return 'N/A';
      const value = num.toFixed(4);
      return exchange === 'upbit' ? `${value} KRW` : `${value} USDT`;
    },
    []
  );
  // ...
});
```

2. API通信の最適化
```typescript
const batchSize = 3;
for (let i = 0; i < symbols.length; i += batchSize) {
  const batch = symbols.slice(i, i + batchSize);
  await Promise.all(batch.map(symbol => fetchPrices(symbol)));
}
```

## テスト実装

1. ユニットテスト:
```bash
npm test cryptoService.test.ts
```

2. E2Eテスト:
```bash
npm run cypress:open
```

## 今後の拡張性

1. 表示する通貨ペアの追加
   - 設定画面からの通貨ペア選択機能
   - 新規通貨ペアの自動検出

2. DEX価格の統合
   - UniswapやPancakeSwapなどのDEXからの価格取得
   - スマートコントラクトとの連携

3. カスタム更新間隔の設定
   - ユーザー設定による更新間隔の変更
   - 通貨ペアごとの更新間隔設定

4. 価格アラート機能
   - 価格差のしきい値設定
   - メール/Slack通知機能

5. 履歴データの表示とチャート機能
   - 価格差の推移グラフ
   - FRの履歴表示
   - データのCSVエクスポート

## 開発プロンプト

このアプリケーションは以下のプロンプトに基づいて開発されました：

```
仮想通貨のミームコインの需給の強さを見るためのWebアプリを作ってください。

需給の強さは先物と現物の価格差とFRで表すものとします。

現物と先物の価格は以下の取引所の価格を参考にします。

- Bybit現物
- Bybit先物
- Binnance現物
- Binance先物
- Bitget現物
- bitget先物
- Upbit現物
- Upbit先物

※取引所に上場していない場合はAerodromeやUniswapのDEX価格を表示

現物価格、先物価格、価格差、先物のFRをいつのレコードとして、いくつかのミームコインを並べて、ミームコインの需給を一覧で画面に表示させてほしいです。

価格の更新は1秒または5秒、パフォーマンスが悪くなってしまう場合は10秒でも問題ありません。

ゆくゆくは、表示させるミームコインを選択できるようにしたいですが、今回はプロトタイプとしてXRP、DOGE、AIXBTを表示させてください。
```

このプロンプトに基づき、React、TypeScript、Material-UIを使用して、複数の取引所から仮想通貨の価格データを取得し、需給状況をリアルタイムで表示するWebアプリケーションを開発しました。
