# LOCK / TYPE / BREAK

マウス / トラックボールのポインティング操作と、キーボードタイピングを同時に練習するシューティングゲームです。

## Features

- 上から接近する敵をクリックしてロック
- ロックした敵の単語をキーボードで入力して撃破
- SCORE / COMBO / ACC / WPM / 平均ロック時間を表示
- NORMAL MODE / PRACTICE MODE
- GitHub Pages 配信用の Vite + React 構成
- MIT License

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

### 1. `package.json` の `homepage` を変更

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/"
```

### 2. Project Pages の場合は base path を指定して deploy

```bash
VITE_BASE_PATH=/YOUR_REPOSITORY_NAME/ npm run deploy
```

Windows PowerShell の場合:

```powershell
$env:VITE_BASE_PATH="/YOUR_REPOSITORY_NAME/"; npm run deploy
```

カスタムドメインや User Pages 直下に置く場合は、通常どおり:

```bash
npm run deploy
```

## License

MIT
