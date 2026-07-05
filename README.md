# Kakeizu Studio

戸籍・出典管理へ拡張できる、React + TypeScript + Vite製のローカルファースト家系図作成アプリです。

## MVPで実装済み

- `family_simple.csv`の読み込み、PapaParse + Zod検証
- 内部ID / 外部ID分離、spouse_ids・父母関係の正規化
- Person + Unionノード方式のSVG家系図表示
- 人物詳細の簡易編集
- CSV出力、JSONバックアップ、PNG/PDF出力
- VitestによるCSV・正規化・往復・レイアウト変換テスト

## 開発

```bash
npm install
npm run dev
npm test
npm run build
```

## MVP土台の安定化（Dexie永続化 / 復元 / インポート）

- 起動時にブラウザ内Dexie（IndexedDB）から保存済みの人物・Union・親子関係・インポート履歴を読み込みます。保存済みデータがない場合のみサンプルCSVを表示します。
- CSVは貼り付けに加えて `.csv` ファイル選択から読み込めます。読み込んだ内容はtextareaに反映され、既存のCSV検証・正規化処理でインポートします。
- CSV検証で `severity: "error"` のissueがある場合は画面・Dexieへ反映しません。warningのみの場合は、人物数・Union数・親子関係数・警告数を確認した上で反映できます。
- 人物詳細パネルで編集したPersonは画面stateだけでなくDexieにも保存され、リロード後も残ります。
- 「データ全削除」からDexie上の全データを削除できます。削除後はサンプル表示に戻ります。
- JSONバックアップは出力に加えて復元に対応しました。復元は現在のデータを全置き換えし、未対応の `schema_version` はエラーになります。
- CSVエクスポート時の `father_id` / `mother_id` は親Personの `gender` を優先して出力します。判定不能・複数親でCSV列からあふれる場合はnoteへ補足を追加します。
- PWA manifestにテキスト管理できるSVGアイコン `/icons/icon.svg`、`/icons/maskable-icon.svg` を設定しました。

### 使い方

1. `npm install` で依存関係をインストールします。
2. `npm run dev` で開発サーバーを起動します。
3. 左パネルの「CSVファイルを選択」またはtextarea貼り付けでCSVを読み込み、「CSVを検証して反映」を押します。
4. 右側の人物詳細で選択中人物を編集すると、Dexieへ自動保存されます。
5. ヘッダーの「JSONバックアップ」でバックアップを保存し、「JSON復元」で全置き換え復元できます。
6. ヘッダーの「CSV出力」「PNG出力」「PDF出力」から各形式で出力できます。

### PWAアイコンについて

- 現時点ではマージ互換性を優先し、バイナリPNGではなくテキスト管理できるSVGアイコンを使用しています。
- PNGの192px / 512px / maskableアイコンは、後続フェーズで手動追加するか、バイナリ追加専用の別PRで追加します。
- アプリ本体の動作にはPNGアイコンは必須ではありません。
