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


## 家系図ビューの操作

- 家系図ビューはSVGベースのMVP簡易レイアウトです。人物ノード、Unionノード、配偶者線、親子線を自動配置し、表示データに合わせてviewBoxを計算します。
- 上部の「＋ 拡大」「− 縮小」で表示倍率を変更できます。
- 「全体表示」は家系図全体が見える基準表示に戻します。
- 「リセット」は拡大率とドラッグ移動量を初期状態に戻します。
- SVG上をドラッグすると表示位置を移動できます。
- 人物ノードをクリックすると、その人物が選択状態としてオレンジでハイライトされ、右側の人物詳細パネルで編集できます。左の人物一覧から選択した場合も家系図側のハイライトが更新されます。
- 現在のレイアウトは、サンプルCSV程度の家系図を見やすく扱うための簡易MVP実装です。ELK.jsやReact Flowのような高度な自動レイアウトエンジン導入は将来対応です。

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

## CSVインポート手順と列マッピング

CSVインポート画面は、実用的な確認ができるように以下のステップ式です。

1. **CSV入力**: `.csv` ファイル選択、textarea貼り付け、またはサンプルCSV読み込みでCSVを入力します。
2. **列マッピング**: CSV側の各列をKakeizu Studio標準項目へ対応付けます。不要な列は「取り込まない」を選択できます。
3. **プレビュー**: 取り込み予定データを表で確認します。行ごとに「正常」「警告あり」「エラーあり」を表示します。
4. **検証**: 人物数、Union数、親子関係数、warning/error件数、仮人物作成予定数、自動補完された配偶者関係数を確認します。
5. **取込**: errorがない場合のみインポートを実行できます。warningがある場合は実行前に確認ダイアログを表示します。

### 日本語列名対応

標準CSVヘッダーは以下です。

```csv
person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
```

ExcelやChatGPTで作ったCSVの列名が日本語でも、自動で候補マッピングします。例: `人物ID` / `個人ID` は `person_id`、`名前` / `氏名` / `人物名` は `name`、`父` / `父親` は `father_id`、`母` / `母親` は `mother_id`、`生年` / `生年月日` は `birth_date`、`配偶者` / `配偶者ID` は `spouse_ids` に対応します。

### 列マッピングの使い方

- CSV列ごとにselectでアプリ項目を選びます。
- 自動判定できた列は初期値が入ります。
- 不要なCSV列は「取り込まない」のままで問題ありません。
- `person_id` と `name` は必須です。どちらかが未マッピングの場合はインポートできません。
- 同じアプリ項目へ複数のCSV列を割り当てた場合はエラーとして扱います。

### サンプルCSVとChatGPT用プロンプト

- 「サンプルCSVをダウンロード」から `kakeizu_sample_family.csv` を保存できます。Excel編集やChatGPTへの入力テンプレートとして利用できます。
- 「ChatGPT用プロンプトをコピー」を押すと、Kakeizu Studio標準ヘッダーでCSVを作成するための指示文をクリップボードへコピーします。コピー後は画面に「コピーしました」と表示します。

### errorとwarningの違い

- **error**: `person_id` / `name` 不足、CSVパース失敗、同一人物を配偶者・親に指定、親子循環など、データ破損につながる問題です。errorが1件でもあるCSVは取り込めません。
- **warning**: 存在しない親ID・配偶者IDなど、確認は必要だが取り込み自体は可能な問題です。warningのみの場合は確認ダイアログに人物数・Union数・親子関係数・警告数を表示し、同意後に取り込めます。

## GitHub Pagesでの公開

- GitHub Pagesのプロジェクトページで公開する場合は、`vite.config.ts` に `base: '/Kakeizu-Studio/'` を設定する必要があります。
- 公開URLは `https://kgymk1-hub.github.io/Kakeizu-Studio/` です。
- GitHub Actionsでビルド成果物の `dist` をGitHub Pagesへデプロイします。
- 公開ページが真っ白画面になる場合は、ブラウザ開発者ツールのNetworkタブで `/assets/...` が404になっていないか確認してください。GitHub Pagesのサブパス配下では `/Kakeizu-Studio/assets/...` として配信される必要があります。
