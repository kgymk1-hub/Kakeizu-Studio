# Kakeizu Studio

戸籍・出典管理へ拡張できる、React + TypeScript + Vite製のローカルファースト家系図作成アプリです。

## MVPで実装済み

- `family_simple.csv`の読み込み、PapaParse + Zod検証
- 内部ID / 外部ID分離、spouse_ids・父母関係の正規化
- Person + Unionノード方式のSVG家系図表示
- 人物詳細の簡易編集
- 人物詳細パネルから父・母・配偶者・子を追加する基本編集フロー
- CSV出力、JSONバックアップ、PNG/PDF出力
- VitestによるCSV・正規化・往復・レイアウト変換テスト

## 開発

```bash
npm install
npm run dev
npm test
npm run build
```
