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
- JSONバックアップは出力に加えて復元に対応しました。復元は現在のデータ（人物・Union・親子関係・資料・出典）を全置き換えし、未対応の `schema_version` はエラーになります。
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

- 公開URLは `https://kgymk1-hub.github.io/Kakeizu-Studio/` です。
- GitHub Pagesのプロジェクトページで公開する場合は、`vite.config.ts` に `base: '/Kakeizu-Studio/'` を設定する必要があります。
- GitHub Actionsでビルド成果物の `dist` をGitHub Pagesへデプロイします。
- `npm run build` 後は、`dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっていることを確認してください。`/assets/...` のままだとプロジェクトページ配下で404になります。
- 公開ページが真っ白画面になる場合は、以下を確認してください。
  - ブラウザDevToolsのNetworkタブで `/assets/...` が404になっていないか確認する。
  - `dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっているか確認する。
  - GitHub ActionsのPagesデプロイが成功しているか確認する。
  - ブラウザやService Workerのキャッシュを避けるため、`https://kgymk1-hub.github.io/Kakeizu-Studio/?v=1` のようにクエリを付けて開く。
- PNG/PDF出力に使う `html2canvas` / `jspdf` は、出力ボタン押下時にdynamic importで読み込む構成です。初期バンドルのchunk size warningが再発した場合は、画像/PDF出力系またはReactアプリ本体chunkの肥大化を疑ってください。

## 資料管理と人物への出典追加

Kakeizu Studio は、戸籍入力モードや本格的な出典管理へ進む前段階として、人物単位で「この情報の根拠」を残すための最小限の Source / Citation 管理に対応しています。

- **資料（Source）**: 戸籍、Webページ、書籍、聞き取りなどの根拠資料そのものです。
- **出典（Citation）**: 選択中の人物に対して、どの資料を根拠として紐づけるかを記録するものです。

### 資料管理の使い方

- 左パネルの「資料一覧」から、根拠資料（Source）を追加できます。
- 登録できる主な項目は、資料名、資料種別、URL、発行者、発行日、取得日、メモです。
- 資料種別は「現在戸籍」「除籍」「改製原戸籍」「Web」「書籍」「聞き取り」「AI生成」「その他」から選択できます。
- 登録済み資料は資料一覧で、資料名、資料種別、URLまたはメモの有無、登録日を確認できます。
- 資料は一覧内で編集・削除できます。資料を削除すると、その資料に紐づく人物出典（Citation）も削除されます。

### 人物に出典を追加する方法

1. 家系図ノードまたは人物一覧から人物を選択します。
2. 右側の人物詳細パネルにある「出典」セクションを開きます。
3. 「この人物に出典を追加」から既存Sourceを選択し、ページ・位置、引用、解釈、確度、メモを入力して保存します。
4. まだ資料を登録していない場合は、出典追加フォーム内で「新しい簡易Sourceを作成」を選び、最小限の資料名と資料種別だけでSourceを作成できます。
5. 出典がある人物は、人物詳細タイトル、左の人物一覧、家系図ノード上の小さな「出典」表示で判別できます。

### 現時点の範囲と将来対応

- 現時点では人物（Person）単位の出典紐づけが中心です。親子関係や婚姻関係など、関係単位へのCitation追加UIは将来対応です。
- Source / Citation のデータ型は、将来の戸籍入力モード、イベント、Union、親子関係、氏名、場所単位のCitationへ拡張しやすいように分離しています。
- 親子関係・UnionへのCitation追加UI、戸籍入力モード、GEDCOM、OCR、AIによる戸籍読み取り、メディア添付は今後の対応予定です。

### CSVインポートとJSONバックアップ/復元

- 単一CSVインポートは家系図データの全置き換えとして動作します。Source / Citation は含まれないため、単一CSVインポートを実行すると既存の資料・出典も置き換え対象になります。資料・出典を保持したい移行では、JSONバックアップまたは標準CSVセットを使用してください。

### JSONバックアップ/復元

- JSONバックアップには、従来の人物・Union・親子関係・インポート履歴に加えて、`sources` と `citations` が含まれます。
- JSON復元時も `sources` / `citations` をDexieへ復元します。
- 旧形式バックアップのように `sources` / `citations` が存在しないJSONでも、空配列として扱うため復元できます。

## 標準CSVセット（複数CSV + manifest.json）

Kakeizu Studio は、既存の単一CSV（`family_simple.csv`）を残したまま、人物・夫婦関係・親子関係・資料・出典をまとめて移行・編集できる標準CSVセットに対応しています。

### JSONバックアップ / 標準CSVセット / 単一CSVの違い

- **JSONバックアップ**
  - アプリ内部形式そのものを保存・復元する形式です。
  - `persons` / `unions` / `parent_child_relations` / `import_batches` / `sources` / `citations` をまとめて保持します。
  - 普段のバックアップや、Kakeizu Studio間で完全に復元したい場合に向いています。
- **標準CSVセット**
  - Excelや外部ツールで編集しやすい、複数CSV + `manifest.json` のZIP形式です。
  - 人物・夫婦関係・親子関係に加えて、資料（Source）・出典（Citation）も含められます。
  - エクスポートファイル名は `kakeizu_standard_csv_set.zip` です。
  - インポート時は、人物・夫婦関係・親子関係・資料・出典・インポート履歴を全置き換えします。
- **単一CSV（family_simple.csv）**
  - 手軽な人物投入用のMVP形式です。
  - Source / Citation は含まれません。
  - 既存の単一CSVインポートは全置き換えで動作するため、インポート時は既存資料・出典も置き換え対象になります。資料・出典を残したい移行では、JSONバックアップまたは標準CSVセットを使用してください。

### ZIP内ファイル

標準CSVセットZIPには以下を含みます。CSVはUTF-8 BOM付きで、カンマ・改行・ダブルクォートを含む値もCSVとしてエスケープされます。空データでもヘッダー行だけのCSVを出力します。

```text
manifest.json
persons.csv
unions.csv
parent_child_relations.csv
sources.csv
citations.csv
```

`manifest.json` は以下の形式です。

```json
{
  "app": "Kakeizu Studio",
  "format": "kakeizu_standard_csv_set",
  "schema_version": "1.0",
  "exported_at": "2026-07-06T00:00:00.000Z",
  "files": [
    "persons.csv",
    "unions.csv",
    "parent_child_relations.csv",
    "sources.csv",
    "citations.csv"
  ]
}
```

### 実際の列仕様

既存モデルに合わせて、一部の仕様名は内部フィールドへ対応付けています。たとえば `persons.csv` の `name` は `Person.display_name`、`birth_date` は `Person.birth_date_text`、`title` は `Person.rank_title` として読み書きします。`unions.csv` の `start_date` は `Union.marriage_date_text`、`end_date` は `Union.end_date_text` として扱います。

#### persons.csv

```csv
id,external_id,name,gender,birth_date,death_date,generation_no,title,note,confidence,created_at,updated_at
```

- `name` は `Person.display_name` に対応します。
- `birth_date` は `Person.birth_date_text`、`death_date` は `Person.death_date_text` に対応します。
- `title` は `Person.rank_title` に対応します。

#### unions.csv

```csv
id,external_id,partner1_id,partner2_id,union_type,start_date,end_date,note,created_at,updated_at
```

- `start_date` は `Union.marriage_date_text` に対応します。
- `end_date` は `Union.end_date_text` に対応します。

#### parent_child_relations.csv

```csv
id,parent_id,child_id,relation_type,confidence,note,created_at,updated_at
```

#### sources.csv

```csv
id,external_id,source_type,title,author_or_issuer,issued_date_text,obtained_date,repository,honseki_text,head_of_registry,registry_type,source_text,url,privacy_level,note,import_batch_id,created_at,updated_at
```

#### citations.csv

```csv
id,external_id,source_id,target_type,target_id,page_or_location,quote_text,interpretation,confidence,note,import_batch_id,created_at,updated_at
```

### インポート時の検証

標準CSVセットインポートでは、反映前プレビューに `persons` / `unions` / `parent_child_relations` / `sources` / `citations` の件数、warning件数、error件数を表示します。errorがある場合はインポートボタンを無効化し、DBへ反映しません。warningのみの場合は確認ダイアログで同意後に反映できます。

参照整合性として、Unionの配偶者ID、親子関係の親・子ID、CitationのSource ID、および `target_type` が `person` / `union` / `relation` のCitation対象IDを確認します。`event` / `name` / `place` は将来用target_typeとしてwarning扱いで読み込みます。
