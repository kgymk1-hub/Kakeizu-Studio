# v1.0準備 UI / コード構成 軽量整理 棚卸し

作成日: 2026-07-11
対象バージョン: Kakeizu Studio v0.9.0 固定後

## 前提確認

本棚卸しは修正実装ではなく、v1.0.0安定版仕上げ前に軽く整理できる候補を確認する目的で実施した。

確認した固定条件は以下のとおり。

- package version: `0.9.0`
- package-lock version: `0.9.0`
- Appヘッダー: `Version 0.9.0`
- README冒頭: `Version 0.9.0`
- JSON backup `schema_version`: `1.4`
- Dexie schema: `version(1)`〜`version(5)`
- 標準CSVセット構造はv0.9.0時点のまま
- Name / Place最小版実装済み

本作業では、DB schema、Dexie version、JSON backup構造、標準CSVセット構造、CSV列、Name / Placeモデル、Project / settingsモデル、package version、AppヘッダーVersion、README冒頭Version、RELEASE_NOTESを変更していない。

## 実行コマンド

事前確認として以下を実行した。

```sh
git status
npm test
npm run build
```

追加確認として以下を実行した。

```sh
npx tsc --noEmit
node -p "require('./package.json').version"
node -p "require('./package-lock.json').version"
rg -n "TODO|FIXME|console\.log|unused|NamePlace|ValidationPanel|ImportReport|public_output_mode|schema_version|version\(5\)" src docs README.md
rg -n "名前・別名|別名|Name|Place|場所|資料|出典|Citation|引用|根拠|公開用出力モード|標準CSVセット|JSONバックアップ" src docs README.md
rg -n "className=|\.list|\.card|\.filter|\.search|\.section|\.panel|\.button" src --glob '*.tsx' --glob '*.css'
```

完了確認として以下を実行した。

```sh
npm test
npm run build
git diff --check
rg -n "^(<<<<<<<|=======|>>>>>>>)|^<$" . --glob '!node_modules/**' --glob '!dist/**'
node -p "require('./package.json').version"
node -p "require('./package-lock.json').version"
```

## 1. App.tsxの肥大化箇所

`src/App.tsx`は388行で、アプリ全体のオーケストレーションを担っている。主な責務は以下。

- IndexedDB / repository経由の初期読み込み、保存、削除、復元
- Project / ViewSetting / ExportSetting / PrivacySettingの読み込みと保存
- Person / Union / ParentChildRelation / Source / Citation / Event / Name / Place / ImportBatchのstate保持
- CSV、標準CSVセット、JSONバックアップ、PNG/PDF/SVG出力の入口
- Validation、layout、選択ターゲット解決
- 左ペインの多数パネル、中央家系図、右人物詳細の配置

### stateが多い箇所

`App`直下に、データ本体、検証、選択、取込プレビュー、取込レポート、Project/settings、出力状態が集中している。

- データ本体: persons / unions / relations / sources / citations / events / names / places / importBatches
- UI状態: selectedId / status / isLoading / exporting
- インポート状態: standardPreview / standardImportPolicy / standardPlaceholderPersonPolicy / lastImportReport
- settings状態: project / viewSetting / exportSetting / privacySetting

### handlerが集中している箇所

保存・削除・入出力handlerがAppに集中している。

- Source / Citation / Event保存・削除
- ParentChildRelation / Union保存・削除
- Name / Place保存・削除
- Koseki入力反映
- JSON backup復元
- 標準CSVセットプレビュー・反映
- CSV / JSON / 標準CSV / PNG / PDF / SVG出力
- Project/settings保存

特に、削除時に関連CitationやEvent / Sourceの参照を安全処理するhandlerは、モデル境界に近いため安易な分割は危険。

### JSXが長い箇所

`return`のJSXが1行に近い形で非常に長く、以下が同じ階層に混在している。

- ヘッダーナビゲーション
- プロジェクト / 設定パネル
- 標準CSVセットパネル
- 取込・レイアウト状況パネル
- ImportReportPanel
- 取込履歴
- ValidationPanel、SourceManager、KosekiEntryPanel、各一覧パネル、NamePlacePanel
- FamilyTreeViewの表示・出力設定handler
- PersonDetailPanelの多数propsとName保存/削除inline handler

### v1.0前に軽く分割してよい候補

- App内の`ImportReportPanel`を`src/components/`配下へ移動する。
- 「プロジェクト / 設定」パネルを小さな表示コンポーネントへ切り出す。ただし保存handlerはAppに残す。
- 「取込・レイアウト状況」パネルを表示専用コンポーネント化する。
- 「取込履歴」表示を表示専用コンポーネント化する。
- 標準CSVセットプレビューのうち、メトリクス表示・issue表示など純表示部分だけを小さく分ける。

### v1.0後に回すべき大きな分割候補

- App全体のstateを機能別hookへ分解すること。
- Repository / Service層の再設計。
- 標準CSVセット取込フロー全体の画面分離。
- PersonDetailPanelとApp間の保存・削除契約の大幅整理。
- Project/settings読み込み・保存の専用状態管理化。

### 分割しない方がよい箇所

- v1.0直前にDB書き込み順序や関連Citation削除を伴うhandlerを大きく移動すること。
- Dexie schema / JSON schema / 標準CSVセット境界に触れる分割。
- `applyData`のデータ一括反映責務を複数箇所に分散すること。

## 2. 重複しているUI部品候補

### 重複している可能性があるUI

- 検索欄とフィルタUI: PersonListPanel、EventListPanel、SourceCitationPanel、ValidationPanelで類似。
- 件数表示: `x / y 件を表示`、warning/errorメトリクス、ImportReportメトリクスで類似。
- 0件表示: 「条件に一致する...がありません」「...はありません」「問題はありません」が複数箇所に存在。
- 一覧カード: Person / Event / Source / Citation / Validation issueで構造が近い。
- 警告・エラー表示: `.warning`、`.error`、`.issue-list`、`.issue-box`、Validation issue表示が類似。
- インポート結果表示: CsvImport内、App内標準CSVセットプレビュー、ImportReportPanelで、matchSummary / policyPlan / unresolvedReference / issue表示が重複。

### 共通化するとよさそうな部品

- `EmptyState`相当の0件表示。
- `MetricPills`相当のメトリクス表示。
- `IssueList`相当のissue表示。CsvImportには局所関数が既にあるため、App標準CSVセットプレビューと共通化余地あり。
- `ListPanelHeader`または件数表示のみの小部品。

### 共通化すると逆に複雑になりそうな部品

- Person / Event / Source / Citationの一覧カード本体。各カードは対象固有の表示項目や移動可否があり、汎用化しすぎるとpropsが肥大化する。
- ImportPolicySelectorとPlaceholderPersonPolicySelector。形は似ているが、文言・制御対象・注意表示が異なるためv1.0前の抽象化は不要。
- PersonDetailPanel内のCitationForm / EventForm / NameForm。局所性が高く、切り出しはv1.0後でよい。

### v1.0前に共通化してよいもの

- 0件表示、メトリクスpill、issue表示など表示専用で副作用がない小部品。
- App内のImportReportPanel移動。

### v1.0後でよいもの

- 一覧カードの本格共通化。
- インポートプレビュー全体の共通化。
- form部品の大規模共通化。

## 3. 未使用import / 未使用関数候補

`npm run build`と`npx tsc --noEmit`はいずれも成功したため、TypeScriptコンパイル上の未使用import / 未使用ローカル変数エラーは確認されなかった。

ただし、以下は削除前に利用状況を慎重確認したい候補。

- `src/styles/app.css`の`.person-list`は現行のPersonListPanelでは`.person-list-panel` / `.person-list-cards`を使っており、旧UI由来の可能性がある。
- コンポーネント固有CSSのうち、`.person-list-controls`、`.event-list-controls`、`.source-citation-controls`は後段の`.list-panel-controls`と役割が重なる。
- `ImportReportPanel`はApp内でのみ使用されるため未使用ではないが、配置としてはcomponents配下への移動候補。
- `CsvImport.tsx`内の局所`IssueList`は同ファイル内で使用されているが、App標準CSVセット側に同等表示がある。

今回は削除していない。

## 4. UI文言の揺れ

### 用語が揺れている箇所

- `JSON backup`、`JSONバックアップ`、`JSON復元`が混在。
- `標準CSVセットZIPをインポート`、`標準CSVセットの複数ファイルをインポート`、`標準CSVセットを反映`のように、取込・インポート・反映が用途別に混在。
- `資料`、`Source`、`参照先資料なし`が混在。UIでは資料、モデル・target_typeではSourceという使い分けは概ね妥当。
- `出典`、`Citation`、`根拠`、`引用`が混在。UIでは出典/引用、仕様ではCitation、説明文では根拠という使い分けになっている。
- `Event`と`出来事`が混在。PersonDetailPanelでは「出来事（Event）」、一覧ではEvent表記が中心。
- `Name`、`名前・別名`、`別名`が混在。v0.9方針上、Nameはモデル名、UIでは名前・別名が妥当。
- `Place`、`場所`、`場所情報`、`Place参照`が混在。Placeは正規化候補、場所は表示テキストという使い分けを明示した方がよい。
- `公開用出力モード`と`公開用出力`が混在。
- `ImportReport`と`インポート結果レポート`が混在。

### 統一した方がよい表記

- UIボタン: `JSONバックアップ` / `JSONバックアップ復元`へ寄せる。
- UI説明: `標準CSVセットを取り込む`または`標準CSVセットをインポート`へ寄せ、最終ボタンは`反映`のままでもよい。
- ユーザー向け: `資料（Source）`、`出典（Citation）`、`出来事（Event）`の初出併記。
- Name / Place: `名前・別名（Name）`、`場所候補（Place）`のように、モデル名と日本語の役割を分ける。

### README / docs / UIで使い分けた方がよい表記

- README / docs: モデル・schemaは英語名を維持し、日本語説明を添える。
- UI: ユーザー操作は日本語中心、必要な箇所だけ`Name` / `Place` / `Event`を併記する。
- 実装: 型名・target_type・schema名は英語のまま維持。

### v1.0前に直した方がよい文言

- README古いv0.4.0節の「Name / Place モデルが未実装」記述は、履歴節であることが分かるよう注意が必要。ただし履歴として残すなら変更不要。
- UIの`JSON復元`は`JSONバックアップ復元`の方が誤解が少ない。
- `インポート` / `取込`の表記方針をREADMEとUIで軽く揃える。

### v1.0後でもよい文言

- Source / Citation / Eventの全面日本語化。
- Name / Place詳細画面追加時の用語再整理。

## 5. README / 仕様書 / 実装の用語ずれ

### READMEにはあるが実装にない、または薄い機能

READMEはv0.9.0の未対応範囲として、Name詳細専用画面、Place詳細専用画面、Source編集UIでのPlace選択、Citation編集UIでのname/place本格選択、標準CSVセットへの`names.csv` / `places.csv`追加を明記しており、実装境界と大きな矛盾はない。

### 実装済みだがREADMEに薄い機能

- Place削除時に`Event.place_id` / `Source.place_id`と関連Citationを安全処理する実装はあるが、READMEではチェック項目中心で詳細説明は薄い。
- `ImportReportPanel`は画面表示用として実装されているが、READMEではv0.7履歴の説明が中心。

### 仕様書では将来対応だが実装済みになっているもの

- `docs/specification.md`はv0.9.0時点でName / Place最小版、Source.place_id、Citation target_type=name/place安全表示・検証、JSON backup 1.4、Dexie version(5)を反映している。大きな逆転は見当たらない。

### 仕様書では実装済みだが実装が薄いもの

- ImportReportは仕様通りDB永続保存なしの画面表示用で、詳細画面や履歴からの再表示は未対応。
- 公開用出力モードは表示・出力時マスクの最小版で、公開用JSONバックアップやCSVマスク出力は未対応。
- Name / Placeは最小連携であり、標準CSVセット入出力や本格Citation編集は未対応。

### v0.9.0時点の未対応事項として明記維持すべきもの

- 標準CSVセットに`names.csv` / `places.csv`は追加しない。
- Citation `target_type=name/place`の本格選択UIは未対応。
- NameとPerson表示名の完全同期はしない。
- Placeと`Event.place_text` / `Source.honseki_text` / `Source.repository`の完全同期はしない。
- Projectの複数プロジェクト切替や各データへの`project_id`付与は未対応。
- 公開用JSONバックアップは未対応。

## 6. CSSの重複候補

`src/styles/app.css`は170行だが、前半が圧縮気味の単一行CSS、後半がv0.6の共有list/search仕上げCSSとして分かれている。

### 重複・整理候補

- `.person-list-controls`、`.event-list-controls`、`.source-citation-controls`と`.list-panel-controls`の責務が重複。
- `.person-list-count`、`.event-list-count`、`.source-citation-count`と`.list-panel-count`の責務が重複。
- `.person-list-cards`、`.event-list-cards`、`.source-citation-cards`と`.list-card-list`の責務が重複。
- `.person-list-card`、`.event-list-card`、`.source-citation-card`と`.list-card` / `.list-card-clickable`の責務が重複。
- `.notice`、`.warning`、`.error`、`.success`、`.issue-box`、`.issue-list`、`.validation-issue`の警告・問題表示系が複数系統。
- `.source-list`と`.citation-list`は似ているが、SourceManagerとPersonDetailPanel固有の意味があり、即共通化は不要。

### コンポーネント固有CSSと共通CSSの混在

- app.cssに全コンポーネントのスタイルが集約されている。
- list系の共有CSSは存在するが、コンポーネント固有CSSも同じファイル内にある。
- v1.0前はCSSファイル分割よりも、重複しやすいlist系クラスの使い分け整理に留めるのが安全。

### v1.0前に軽く整理してよいCSS

- 未使用の可能性が高い旧`.person-list`周辺を確認してから候補化。
- list系の明らかな重複プロパティを共通`.list-*`へ寄せる小修正。
- CSSのコメントで共有list系とコンポーネント固有系の境界を明示。

### v1.0後に回すべきCSS再設計

- CSS Modules化やコンポーネント別CSS分割。
- design token化。
- レイアウト全体の再設計。
- UI全面変更を伴うカード/テーブル統一。

## 7. 分割候補コンポーネント

### v1.0前に分割してもよい小粒候補

- `ImportReportPanel`
- `ProjectSettingsSummaryPanel`または`PrivacySettingPanel`の表示部分
- `ImportStatusPanel`
- `ImportHistoryPanel`
- `MetricPills`
- `EmptyState`
- `IssueList`

### v1.0後に回すべき中〜大粒候補

- 標準CSVセット取込パネル全体
- Project/settings読み込み・保存hook
- Name / Place関連handlerの専用hook化
- Validation関連handlerと表示の大規模整理
- PersonDetailPanel内のCitation / Event / Relation / Nameセクション分割
- FamilyTreeViewのツールバー・出力設定・SVG描画分離

### 分割しない方がよい候補

- v1.0直前のApp全面分割
- DB保存・関連削除・復元処理を伴うhandlerの広範囲移動
- schemaや標準CSVセット境界を変える分割
- 状態管理方式の変更を伴う分割

## 8. 優先度分類

### A: v1.0前に実施してよい軽量整理

- UI文言の小さな統一。
- README / docsの表記補足。
- 明らかな未使用importや未使用CSS候補の削除。ただし削除前に`rg`で再確認する。
- `ImportReportPanel`などApp内の表示専用小コンポーネント移動。
- `MetricPills`、`EmptyState`、`IssueList`程度の小さな共通UI部品化。
- list系CSSの軽い重複整理。

### B: v1.0後に回すべき整理

- App.tsx大規模分割。
- Repository / Service層の大規模再設計。
- CSS全面再設計。
- 複数画面構成の再設計。
- 状態管理方式の変更。
- PersonDetailPanelやFamilyTreeViewの大規模分割。
- 標準CSVセット取込フローの本格画面化。

### C: やらない方がよい整理

- DB schemaを伴う整理。
- Dexie `version(6)`追加を伴う整理。
- JSON `schema_version`変更を伴う整理。
- 標準CSVセット構造変更を伴う整理。
- CSV列追加を伴う整理。
- Name / Placeモデル変更を伴う整理。
- Project / settingsモデル変更を伴う整理。
- v1.0直前の大規模UI変更。
- RELEASE_NOTESへの先行追記。

## 次に実施するなら

v1.0前に実施するなら、最も安全なのは以下の順序。

1. UI文言の小さな統一方針を決める。
2. `ImportReportPanel`、`ImportStatusPanel`、`ImportHistoryPanel`のような表示専用部分だけをAppから切り出す。
3. `MetricPills` / `EmptyState` / `IssueList`のような副作用なし小部品を導入する。
4. CSSはlist系の明らかな重複だけを小さく整理する。

この順序なら、DB / JSON / CSV schemaやName / Place / Project settingsモデルに触れず、v1.0直前の回帰リスクを抑えられる。
