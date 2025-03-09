FROM node:18-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install --legacy-peer-deps

# ソースコードをコピー
COPY . .

# ポートの公開
EXPOSE 3000

# 開発モードで実行
ENV NODE_ENV=development
CMD ["npm", "start"]
