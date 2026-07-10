# Kakeizu Studio v0.8.0 Release Notes

## バージョン

- Version: `v0.8.0`
- Package version: `0.8.0`
- Release type: Project / 表示設定 / 出力設定 / プライバシー設定正式版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.8.0>

## v0.8.0 - Project / 表示設定 / 出力設定 / プライバシー設定

### Added

- Projectモデル最小版を追加しました。
- ViewSettingモデル最小版を追加しました。
- ExportSettingモデル最小版を追加しました。
- PrivacySetting相当の設定を追加しました。
- 表示設定・出力設定をDBに保存できるようにしました。
- 公開用出力モード最小版を追加しました。
- Project / settingsをJSONバックアップに含められるようにしました。

### Changed

- JSON backup schema_version を 1.3 に更新しました。
- Project / settings用にDexie schema version(4)を追加しました。
- 家系図の表示設定・出力用見た目設定をProject設定として扱う土台を整えました。
- 画面凡例と出力凡例の責務を整理しました。
- 公開用出力モードON時の人物ノード表示マスクを整理しました。
- READMEをv0.8.0正式版向けに整理しました。

### Notes

- v0.8.0時点では、Projectは単一default project相当です。
- 完全な複数Project切替は未対応です。
- Person等への project_id 付与は未対応です。
- 公開用出力モードは表示・出力時のみマスクします。
- 元Personデータ、CSV出力、JSONバックアップ、標準CSVセット出力は勝手にマスクしません。
- 画面凡例と出力凡例は、現行DOMキャプチャ方式では連動扱いです。
- JSON 1.2以前の復元互換を維持しています。
- 標準CSVセット構造は変更していません。

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.8.0
git push origin v0.8.0
```

---

# Kakeizu Studio v0.7.0 Release Notes

## バージョン

- Version: `v0.7.0`
- Package version: `0.7.0`
- Release type: CSVインポート本格化正式版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.7.0>

## v0.7.0 - CSVインポート本格化

### Added

- CSVインポート結果プレビューを強化しました。
- 取込方式選択を追加しました。
- 既存external_id照合結果を表示できるようにしました。
- 参照先不明と仮人物作成候補をプレビュー表示できるようにしました。
- 標準CSVセットの検証を強化しました。
- ImportBatch最小版として取込履歴を記録・表示できるようにしました。
- インポート結果レポートを表示できるようにしました。

### Changed

- 標準CSVセット取り込み前の検証表示を整理しました。
- CSVインポート画面で、取込前プレビュー・取込履歴・取込後レポートの流れが分かりやすくなるよう整理しました。
- READMEをv0.7.0正式版向けに整理しました。

### Notes

- 実行可能な取込方式は、引き続き `replace_all` + `warn_and_skip` + errorなし のみです。
- `append_new` / `update_by_external_id` / `skip_existing` / `add_as_new_ids` は現時点ではプレビューのみです。
- `block_import` / `create_placeholder_preview` も現時点ではプレビューのみです。
- 仮人物の実保存、全置換以外の実保存、詳細レポートのDB永続保存は未対応です。
- JSON schema_version は 1.2 のままです。
- Dexie schema version は変更していません。
- 標準CSVセット構造は変更していません。

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.7.0
git push origin v0.7.0
```

---

# Kakeizu Studio v0.6.0 Release Notes

## バージョン

- Version: `v0.6.0`
- Package version: `0.6.0`
- Release type: 検索・一覧・検証結果からの修正導線正式版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.6.0>

## v0.6.0 - 検索・一覧・検証結果からの修正導線

### Added

- 共通選択・ジャンプ基盤を追加しました。
- Person一覧・検索・簡易フィルタを追加しました。
- Event一覧・event_typeフィルタ・簡易検索を追加しました。
- Source / Citation一覧を追加しました。
- Source種別フィルタ、Citation target_typeフィルタを追加しました。
- Citation対象名表示を追加しました。
- Sourceクリックによる関連Citation絞り込みを追加しました。
- ValidationPanelの検証結果から対象へ移動する導線を追加しました。
- 一覧・検索UIの共通スタイルを追加しました。
- 左側パネルの縦長化とスマホ幅表示に最低限対応しました。

### Changed

- READMEをv0.6.0正式版向けに整理しました。
- ValidationPanelのSource / Citation issueを、現時点では対象へ移動不可として分かりやすく表示しました。
- Person / Event / Source / Citation / ValidationPanelの検索欄・フィルタ・件数表示・0件表示の見た目を整理しました。

### Notes

- Event詳細編集UIへの本格ジャンプは未対応です。
- Source / Citation詳細画面は未対応です。
- Source / Citation issueからの直接ジャンプは未対応です。
- 本格ソート、ページネーション、仮想スクロールは未対応です。
- Project / ViewSetting / ExportSetting、Name / Place、CSVインポート本格改修は後続対応です。
- JSON backup の `schema_version`、Dexie schema version、DBテーブル、標準CSVセットの構造は変更していません。

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.6.0
git push origin v0.6.0
```

---

# Kakeizu Studio v0.5.0 Release Notes

## バージョン

- Version: `v0.5.0`
- Package version: `0.5.0`
- Release type: 家系図表示・出力の見栄え強化正式版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.5.0>

## v0.5.0 - 家系図表示・出力の見栄え強化

### Added

- 家系図ノードの表示密度切替を追加しました。
- 人物ノードに生没年・出典有無・確度・確認状態を表示しました。
- 親子関係・夫婦/パートナー関係の種類や状態に応じた関係線表示を追加しました。
- 関係線凡例を追加しました。
- 出力用タイトル、凡例ON/OFF、背景切替の簡易設定を追加しました。
- SVG出力最小版を追加しました。

### Changed

- PNG/PDF出力時に操作UIが写り込まないように調整しました。
- READMEのv0.5説明を正式版向けに整理しました。

### Notes

- SVG出力は最小版で、`foreignObject` を利用するため表示環境によって再現性に差があります。
- ELK.js / React Flow / 複数ビュー本格対応、Project / ViewSetting / ExportSetting永続化、本格的な用紙サイズ指定やページ分割は未対応です。
- JSON backup の `schema_version`、Dexie schema version、DBテーブル、標準CSVセットの構造は変更していません。

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.5.0
git push origin v0.5.0
```

---

# Kakeizu Studio v0.4.0 Release Notes

## バージョン

- Version: `v0.4.0`
- Package version: `0.4.0`
- Release type: 検証エンジン / データ検証結果パネル / 検証結果フィルタ / 日付・年齢チェック正式区切り版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.4.0>

## 主な追加機能

- 検証エンジン最小版を追加しました。
- DB / Dexie / UI に直接依存しない純粋関数 `validateFamilyData` を追加しました。
- 検証対象は Person / Event / Union / ParentChildRelation / Source / Citation です。Source は Citation の `source_id` 参照先として確認します。
- Person / Event / ParentChildRelation / Union の出典なしチェックに対応しました。
- Person / Event / ParentChildRelation / Union の未確認チェック（`review_status === "unreviewed"`）に対応しました。
- Person / Event / ParentChildRelation / Union の低確度チェック（`confidence === "uncertain"` / `"disputed"`）に対応しました。`likely` は警告対象外です。
- Union / ParentChildRelation / Event / Citation の参照先不明チェックに対応しました。
- ParentChildRelation と Union の自己参照チェックに対応しました。
- 4桁西暦年ベースの日付・年齢チェックに対応しました。
- `extractYear` により、`1900`、`1900年`、`1900-01-01`、`1900/01/01`、`西暦1900年`、`約1900年`、`1900頃`、`1900年頃`、`c.1900`、`ca.1900` などから年を抽出できます。
- Person の死亡年 < 出生年、ParentChildRelation の子出生年 < 親出生年、親子年齢差、Union の婚姻年・離婚年・終了年、Person対象Eventの出生前 / 死亡後を検出できます。
- `ValidationPanel` として、画面内に「データ検証結果」パネルを追加しました。
- error / warning / info / total 件数表示に対応しました。
- severity / category / target_type フィルタに対応しました。
- 条件一致件数 / 全体件数表示に対応しました。
- issue一覧表示、Person対象時の人物名表示、最大50件表示制限に対応しました。

## v0.3.0からの変更点

- v0.3.0の関係単位Citation UI / 関係削除UI / 関係編集UIを維持したまま、データ品質確認用の検証エンジンと最小UIを追加しました。
- 既存の取込・レイアウト状況とは別に、現在のアプリデータに対する「データ検証結果」を確認できるようにしました。
- 出典なし、未確認、低確度、参照先不明、自己参照、日付矛盾、年齢警告を、severity / category / target_type で絞り込めるようにしました。
- 日付チェックは4桁西暦年ベースの最小実装に留め、和暦・曖昧日付・月日単位比較の本格対応は次フェーズ以降に残しています。

## データ形式の変更

- 新しいDBテーブルは追加していません。
- JSON backup の `schema_version` は必要がなければ `"1.2"` のままです。
- 検証結果は保存データではなく、現在のアプリデータから都度算出します。
- 既存CSV / 標準CSVセット / JSONバックアップ形式に破壊的変更はありません。
- Citation の `target_type: "name"` / `"place"` は Name / Place モデルが未実装のため、現時点では参照先不明errorにしません。

## 既知の制限

- issueから対象へのジャンプは未対応です。
- issueクリックによる人物選択は未対応です。
- 自動修正は未対応です。
- 保存されるフィルタ設定は未対応です。
- 和暦の本格変換は未対応です。
- 曖昧日付の高度解析は未対応です。
- 月日単位の厳密比較は未対応です。
- 同姓同名候補検出は未対応です。
- 婚姻時年齢チェックは未対応です。
- 死亡後婚姻チェックの詳細ルールは未対応です。
- 死亡後出生チェックの詳細ルールは未対応です。
- AI生成CSV専用確認画面は未対応です。
- Project / ViewSetting / ExportSetting は未対応です。
- Name / Place / Media は未対応です。
- GEDCOM / OCR / AI戸籍読み取りは未対応です。

## 次フェーズ候補

- issueから対象へのジャンプ、issueクリックによる人物選択
- 検証結果の検索UIや保存されるフィルタ設定
- 和暦の本格変換、曖昧日付の高度解析、月日単位の比較
- 同姓同名候補検出や婚姻時年齢チェックなどの追加検証ルール
- Project / ViewSetting / ExportSetting、Name / Place / Media
- GEDCOM / OCR / AI戸籍読み取り

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.4.0
git push origin v0.4.0
```

GitHub上でReleaseを作る場合は、tag `v0.4.0` を使ってReleaseを作成してください。

## GitHub Release body

Kakeizu Studio v0.4.0を公開します。

公開URL: https://kgymk1-hub.github.io/Kakeizu-Studio/

v0.4.0では、検証エンジン最小版、データ検証結果パネル、検証結果フィルタ、4桁西暦年ベースの日付・年齢チェックに対応しました。`validateFamilyData` は DB / Dexie / UI に直接依存しない純粋関数で、Person / Event / Union / ParentChildRelation / Source / Citation を対象に、出典なし、未確認、低確度、参照先不明、自己参照、日付矛盾、年齢警告を検出します。

画面上では「データ検証結果」パネルで error / warning / info / total 件数、issue一覧、Person対象時の人物名を確認できます。severity / category / target_type フィルタ、条件一致件数 / 全体件数表示、最大50件表示制限にも対応しています。

日付・年齢チェックでは `extractYear` により、`1900`、`1900年`、`1900-01-01`、`1900/01/01`、`西暦1900年`、`約1900年`、`1900頃`、`1900年頃`、`c.1900`、`ca.1900` などから4桁西暦年を抽出し、Personの死亡年 < 出生年、ParentChildRelationの子出生年 < 親出生年、親子年齢差、Unionの婚姻年・離婚年・終了年、Person対象Eventの出生前 / 死亡後を検出します。

データ形式として、新しいDBテーブルは追加していません。JSON backup の schema_version は必要がなければ 1.2 のままです。検証結果は保存データではなく現在のアプリデータから都度算出し、既存CSV / 標準CSVセット / JSONバックアップ形式に破壊的変更はありません。

既知の制限として、issueから対象へのジャンプ、issueクリックによる人物選択、自動修正、保存されるフィルタ設定、和暦の本格変換、曖昧日付の高度解析、月日単位の厳密比較、同姓同名候補検出、婚姻時年齢チェック、死亡後婚姻チェックの詳細ルール、死亡後出生チェックの詳細ルール、AI生成CSV専用確認画面、Project / ViewSetting / ExportSetting、Name / Place / Media、GEDCOM / OCR / AI戸籍読み取りは未対応です。

# Kakeizu Studio v0.3.0 Release Notes

## バージョン

- Version: `v0.3.0`
- Package version: `0.3.0`
- Release type: 関係単位Citation UI / 関係削除UI / 関係編集UI 正式区切り版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.3.0>

## 主な追加機能

- 関係単位Citation UIに対応しました。
- 親子関係Citation（`target_type: "relation"` / `target_id: ParentChildRelation.id`）に対応しました。
- 夫婦関係Citation（`target_type: "union"` / `target_id: Union.id`）に対応しました。
- Source違いの複数Citation表示に対応しました。
- 関係Citationの追加・編集・削除に対応しました。
- 同一Source/Relation、同一Source/UnionのCitation重複回避に対応しました。
- Source欠損時の安全表示に対応しました。
- 戸籍入力モードで父・母・配偶者登録時に関係Citationを自動作成または更新します。
- 関係削除UIに対応しました。
- 関係削除時のCitation同時削除に対応しました。
- 関係編集UIに対応しました。
- 親子関係属性編集（`relation_type`、開始日、終了日、確度、レビュー状態、メモ）に対応しました。
- 夫婦関係属性編集（`union_type`、婚姻日、離婚日、終了日、終了理由、状態、確度、レビュー状態、メモ）に対応しました。
- 標準CSVセットの `parent_child_relations.csv` / `unions.csv` を関係属性列へ拡張しました。
- 旧 `start_date` / `end_date` 列の読み込み互換を維持しました。

## v0.2.0からの変更点

- v0.2.0の人物・Event中心の出典管理に加えて、親子関係と夫婦関係そのものへ根拠を残せるようにしました。
- 戸籍入力モードで人物・Eventだけでなく、父・母・配偶者登録で作成または更新される関係にもCitationを付与できるようにしました。
- 人物詳細画面から誤登録した親子関係・夫婦関係を削除できるようにし、紐づく関係Citationも同時に削除するようにしました。
- 人物詳細画面から親子関係・夫婦関係の基本属性を編集できるようにしました。
- JSONバックアップと標準CSVセットで、関係・関係Citation・関係属性を維持できるようにしました。

## データ形式の変更

- JSON `schema_version` は必要がなければ `"1.2"` のままです。
- 関係Citationは既存 `citations` 配列に `target_type: "relation"` / `target_type: "union"` として保存されます。
- 親子関係Citationは `target_type: "relation"` / `target_id: ParentChildRelation.id` です。
- 夫婦関係Citationは `target_type: "union"` / `target_id: Union.id` です。
- 標準CSVセットの `citations.csv` に relation / union Citation が含まれます。
- `parent_child_relations.csv` に `start_date_text` / `end_date_text` / `review_status` が含まれます。
- `unions.csv` に `marriage_date_text` / `divorce_date_text` / `end_date_text` / `end_reason` / `status` / `review_status` が含まれます。
- 旧 `start_date` / `end_date` 列も読み込み互換があります。

## 既知の制限

- 親・子・配偶者の相手変更は未対応です。
- 関係編集のUndoは未対応です。
- Person削除は未対応です。
- EventからPerson基本情報への自動同期は未対応です。
- marriage EventからUnion自動作成は未対応です。
- adoption EventからParentChildRelation自動作成は未対応です。
- Eventは家系図ノード上にはまだ表示しません。
- Timeline表示、Event検索・フィルタは未対応です。
- 戸籍画像添付は未対応です。
- OCR / AI戸籍読み取りは未対応です。
- GEDCOMは未対応です。
- ELK.js、React Flow、Excel xlsx直接入出力、大規模UIリデザインは未対応です。

## 次フェーズ候補

- 関係単位Citationのさらなる強化
- Eventの高度検索・タイムライン
- 場所、氏名単位CitationのUI追加
- 戸籍画像添付、OCR / AI戸籍読み取り
- GEDCOM入出力
- 複雑な家系図レイアウト改善

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.3.0
git push origin v0.3.0
```

GitHub上でReleaseを作る場合は、tag `v0.3.0` を使ってReleaseを作成してください。

## GitHub Release body

Kakeizu Studio v0.3.0を公開します。

公開URL: https://kgymk1-hub.github.io/Kakeizu-Studio/

v0.3.0では、関係単位Citation UI、関係削除UI、関係編集UIに対応しました。人物詳細画面の「関係の出典」から、親子関係Citation（target_type: relation）と夫婦関係Citation（target_type: union）を表示・追加・編集・削除できます。Source違いの複数Citation表示、同一Source/Relation・同一Source/Unionの重複回避、Source欠損時の安全表示にも対応しています。

戸籍入力モードでは、父・母・配偶者登録時に関係Citationを自動作成または更新します。親子関係・夫婦関係の削除UIでは、対象関係に紐づくCitationも同時に削除します。関係編集UIでは、親子関係の relation_type / 日付 / 確度 / レビュー / メモ、夫婦関係の union_type / 婚姻日 / 離婚日 / 終了日 / 状態 / 確度 / レビュー / メモを編集できます。親・子・配偶者の相手変更は未対応です。

データ形式として、JSON schema_version は必要がなければ 1.2 のままです。関係Citationは既存 citations 配列に target_type: relation / union として保存され、標準CSVセットの citations.csv にも含まれます。parent_child_relations.csv は start_date_text / end_date_text / review_status、unions.csv は marriage_date_text / divorce_date_text / end_date_text / end_reason / status / review_status を含み、旧 start_date / end_date 列の読み込み互換も維持しています。

既知の制限として、親・子・配偶者の相手変更、関係編集のUndo、Person削除、EventからPerson基本情報への自動同期、marriage EventからUnion自動作成、adoption EventからParentChildRelation自動作成、家系図ノード上へのEvent表示、Timeline表示、Event検索・フィルタ、戸籍画像添付、OCR / AI戸籍読み取り、GEDCOMは未対応です。

# Kakeizu Studio v0.2.0 Release Notes

## バージョン

- Version: `v0.2.0`
- Package version: `0.2.0`
- Release type: 戸籍入力モード / Eventモデル正式区切り版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.2.0>

## 主な追加機能

- 戸籍入力モードを追加しました。
- 戸籍資料Sourceの選択・簡易作成に対応しました。
- 戸籍資料に基づく人物追加・更新に対応しました。
- 人物Citation自動作成に対応しました。
- 父・母・配偶者の任意登録に対応しました。
- Eventモデルを追加しました。
- Dexie `events` テーブルを追加しました。
- 人物詳細でのEvent追加・編集・削除に対応しました。
- Event Citationに対応しました。
- 戸籍入力モードから出生Event / 死亡Eventを任意作成できるようにしました。
- 戸籍入力モードから追加Eventを作成できるようにしました。
- 追加Event種別として `marriage` / `divorce` / `adoption` / `recognition` / `entry_registry` / `removal_registry` / `transfer_registry` / `name_change` / `residence` / `occupation` / `title` / `other` に対応しました。
- JSONバックアップ `schema_version` を `1.2` に更新しました。
- 標準CSVセットに `events.csv` を追加しました。

## v0.1.0からの変更点

- 人物・Union・親子関係中心のMVPから、戸籍資料を根拠に人物とEventを登録する入力フローへ拡張しました。
- Source / Citationを戸籍入力モードから利用しやすくし、人物とEventへ根拠を残せるようにしました。
- 人物詳細パネルで、人物に紐づくEventを管理できるようにしました。
- JSONバックアップと標準CSVセットがEventを保持できるようになりました。
- 旧データを読み込める互換性を維持しつつ、Event Citationが実体Eventを参照する形式に整理しました。

## データ形式の変更

- JSONバックアップに `events` が追加されました。
- JSON `schema_version` が `1.2` になりました。
- 旧 `1.0` / `1.1` JSONでも読み込み可能です。`events` が存在しない場合は空配列として扱います。
- 標準CSVセットに `events.csv` が追加されました。
- 旧標準CSVセットで `events.csv` がなくても読み込み可能です。
- Citationの `target_type='event'` が実体Eventを参照するようになりました。
- 単一CSVは引き続き人物投入用であり、Eventは扱いません。Eventを含めた移行にはJSONバックアップまたは標準CSVセットを使います。

## 既知の制限

- Eventは家系図ノード上にはまだ表示しません。
- `Person.birth_date_text` / `Person.death_date_text` と出生・死亡Eventは自動同期しません。
- 追加Eventから人物基本情報や家系図関係へ自動反映しません。
- marriage EventからUnionは自動作成しません。
- adoption EventからParentChildRelationは自動作成しません。
- 関係単位Citation UIは未対応です。
- 戸籍画像添付は未対応です。
- OCR / AI戸籍読み取りは未対応です。
- GEDCOMは未対応です。
- Timeline表示、Event検索・フィルタは未対応です。
- ELK.js、React Flow、Excel xlsx直接入出力、大規模UIリデザインは未対応です。

## 次フェーズ候補

- Eventから人物基本情報への反映方針の検討
- marriage EventからUnion、adoption EventからParentChildRelationへの反映方針の検討
- Timeline表示、Event検索・フィルタ
- 関係単位Citation UI
- 家系図ノード上でのEvent表示方針
- 戸籍画像添付、OCR / AI戸籍読み取り
- GEDCOM入出力
- 複雑な家系図レイアウト改善

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

v0.2.0のタグ作成とpushは、リリース担当者がmainブランチ上で実行してください。

```bash
git tag v0.2.0
git push origin v0.2.0
```

GitHub上でReleaseを作る場合は、tag `v0.2.0` を使ってReleaseを作成してください。

## GitHub Release body

Kakeizu Studio v0.2.0を公開します。

公開URL: https://kgymk1-hub.github.io/Kakeizu-Studio/

v0.2.0では、戸籍入力モード、Eventモデル、戸籍入力モードからのEvent作成に対応しました。戸籍資料Sourceの選択・簡易作成、戸籍資料に基づく人物追加・更新、人物Citation自動作成、父・母・配偶者の任意登録、人物詳細でのEvent追加・編集・削除、Event Citationに対応しています。

戸籍入力モードでは、出生Event / 死亡Eventの任意作成に加えて、marriage / divorce / adoption / recognition / entry_registry / removal_registry / transfer_registry / name_change / residence / occupation / title / other の追加Eventを作成できます。

データ形式として、JSONバックアップは schema_version 1.2 になり `events` を含みます。旧1.0 / 1.1 JSONも読み込み可能です。標準CSVセットには `events.csv` が追加され、旧標準CSVセットで `events.csv` がなくても読み込み可能です。Citationの `target_type='event'` は実体Eventを参照します。

既知の制限として、Eventは家系図ノード上にはまだ表示しません。Person.birth/deathとEventは自動同期しません。追加Eventから人物基本情報やUnion / ParentChildRelationへ自動反映しません。関係単位Citation UI、戸籍画像添付、OCR / AI戸籍読み取り、GEDCOM、Timeline表示、Event検索・フィルタは未対応です。

# Kakeizu Studio v0.1.0 MVP Release Notes

## バージョン

- Version: `v0.1.0`
- Package version: `0.1.0`
- Release type: MVP公開版

## 公開URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.1.0>

## 主な機能

- 単一CSVインポート
- 日本語列名マッピング
- 標準CSVセット入出力
- JSONバックアップ/復元
- SVG家系図ビュー
- 人物詳細編集
- 資料・出典管理
- PNG/PDF出力
- GitHub Pages公開対応

## データ形式

- 単一CSV: `family_simple.csv` 相当の人物中心CSVを取り込みます。
- 標準CSVセット: `manifest.json`、`persons.csv`、`unions.csv`、`parent_child_relations.csv`、`sources.csv`、`citations.csv` を扱います。
- JSONバックアップ: アプリ内部形式の人物・関係・資料・出典・インポート履歴をまとめて保存・復元します。
- 出力形式: CSV、JSON、PNG、PDFをサポートします。

## 既知の制限

- レイアウトはMVP簡易レイアウト
- ZIP読込は無圧縮ZIP前提
- 外部編集後は複数ファイル直接インポート推奨
- Citation UIは人物単位中心
- Shift_JIS CSV自動判定は未対応
- 戸籍入力モード、GEDCOM、OCR、メディア添付は未対応

## 次フェーズ候補

- 複雑な家系図レイアウトへの対応強化
- 関係単位Citation、イベント、場所、氏名単位CitationのUI追加
- 戸籍入力モードの検討
- GEDCOM入出力の検討
- OCR / AI読み取りの検討
- メディア添付の検討
- PWA / オフライン体験の改善

## タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

v0.1.0のタグ作成とpushは、リリース担当者がmainブランチ上で実行してください。

```bash
git tag v0.1.0
git push origin v0.1.0
```

GitHub上でReleaseを作る場合は、tag `v0.1.0` を使ってReleaseを作成してください。

## GitHub Release body

Kakeizu Studio v0.1.0 MVPを公開します。

公開URL: https://kgymk1-hub.github.io/Kakeizu-Studio/

このMVPでは、CSVインポート、日本語列名マッピング、標準CSVセット入出力、JSONバックアップ/復元、SVG家系図ビュー、人物詳細編集、資料・出典管理、PNG/PDF出力、GitHub Pages公開対応を含みます。

既知の制限として、家系図レイアウトはMVP簡易レイアウトであり、ZIP読込は無圧縮ZIP前提です。外部編集後は複数ファイル直接インポートを推奨します。戸籍入力モード、GEDCOM、OCR、メディア添付は未対応です。
