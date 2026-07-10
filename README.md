# Kakeizu Studio

## 概要

Kakeizu Studio は、戸籍・出典管理へ拡張できる React + TypeScript + Vite 製のローカルファースト家系図作成アプリです。ブラウザ内の IndexedDB（Dexie）へ保存するため、MVP公開版ではサーバーを使わずに人物・関係・資料・出典を扱えます。

**Version 0.8.0**

> v0.8.0では、Project / 表示設定 / 出力設定 / プライバシー設定を正式版として整理し、単一default project相当のProjectモデル、ViewSetting、ExportSetting、PrivacySettingをDBへ保存できるようにしました。

## v0.8.0: Project / 表示設定 / 出力設定 / プライバシー設定

v0.8.0では、単一default project相当のProjectモデル、ViewSetting、ExportSetting、PrivacySettingを追加し、表示設定・出力設定・公開用出力モードをDBに保存できるようにしました。また、Project / settingsをJSONバックアップに含めるため、JSON backup `schema_version` を `1.3` に更新しました。

v0.8第1〜第9フェーズと補完フェーズの内容は、正式版の実装内容として以下のとおり整理しています。

- Project / 設定系の現状棚卸し: 既存の画面状態、JSONバックアップ、Dexie schema、未対応事項を `docs/settings_audit_v0.8.md` に整理しました。
- Projectモデル最小版: v0.8時点では単一default project相当として、設定管理の器を追加しました。完全な複数Project切替は未対応です。
- ViewSetting最小版: 表示密度と画面凡例表示設定をDBへ保存・復元できるようにしました。
- ExportSetting最小版: 出力タイトル表示ON/OFF、出力タイトル、出力凡例表示設定、背景 white / transparent / soft を扱う土台を追加しました。
- 出力設定のDB永続化: PNG / PDF / SVG出力対象の見た目設定をProject設定として保存・復元できるようにしました。
- PrivacySetting相当の方針整理: 公開用出力モードの責務、元データを勝手に書き換えない方針、未対応範囲を整理しました。
- 公開用出力モード最小版: 表示・PNG/PDF/SVG出力時のみ、hidden/private人物や生存者日付をマスクする最小動作を追加しました。
- JSONバックアップ互換性確認: Project / settingsを `schema_version: "1.3"` に含め、JSON 1.2以前の復元互換を維持しました。
- 補完フェーズ: 表示設定・出力設定・公開用出力モードの責務を整理し、画面凡例と出力凡例の扱いを明確化しました。
- v0.8全体仕上げ確認: v0.8第1〜第8フェーズと補完フェーズの整合、ドキュメント、テスト、ビルドを確認しました。

### v0.8.0 方針

- v0.8時点では単一default project相当です。
- 完全な複数Project切替は未対応です。
- Person / Union / Relation / Event / Source / Citation への `project_id` 一括追加は未対応です。
- 画面凡例と出力凡例は、現時点のDOMキャプチャ方式では連動扱いです。
- 公開用出力モードは表示・出力時のみマスクします。
- 元Personデータ、CSV出力、JSONバックアップ、標準CSVセット出力は勝手にマスクしません。
- Dexie schema versionはProject / settings用に `version(4)` までを使用し、`version(5)` は追加していません。
- 標準CSVセット構造は変更していません。

## v0.8.0 確認項目

- [ ] Projectモデル最小版がある。
- [ ] default projectが作成・読み込みされる。
- [ ] v0.8時点では単一default project相当である。
- [ ] ViewSettingが保存・復元される。
- [ ] 表示密度が保存・復元される。
- [ ] 画面凡例表示設定が保存・復元される。
- [ ] ExportSettingが保存・復元される。
- [ ] 出力タイトル表示ON/OFFが保存・復元される。
- [ ] 出力タイトルが保存・復元される。
- [ ] 出力凡例表示設定が保存・復元される。
- [ ] 背景 white / transparent / soft が保存・復元される。
- [ ] PrivacySettingが保存・復元される。
- [ ] 公開用出力モードON/OFFが保存・復元される。
- [ ] `public_output_mode` OFFでは既存表示を維持する。
- [ ] `public_output_mode` ONではhidden/private人物や生存者日付が表示・出力時にマスクされる。
- [ ] 元Personデータは書き換えられない。
- [ ] JSON backup `schema_version` 1.3 でProject / settingsが保存される。
- [ ] JSON 1.2以前の復元互換が維持される。
- [ ] Dexie schema `version(4)` が追加されている。
- [ ] 既存CSVインポートv0.7機能が壊れていない。
- [ ] 既存の人物一覧・Event一覧・Source/Citation一覧が壊れていない。
- [ ] 家系図表示が壊れていない。
- [ ] PNG / PDF / SVG出力が壊れていない。
- [ ] 標準CSVセット構造が変わっていない。
- [ ] GitHub Pages確認URL <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.8.0> で公開版を確認できる。

## v0.8.0 時点の未対応事項

- 完全な複数Project切替。
- Person / Union / ParentChildRelation / Event / Source / Citation への `project_id` 付与。
- Project削除。
- Project複製。
- Projectごとのデータ分離。
- 公開用CSV出力。
- 公開用JSONバックアップ。
- 公開用PDF専用レイアウト。
- 生存者判定の高度化。
- 添付ファイル・戸籍画像のマスク。
- 画面凡例と出力凡例の完全分離。
- Name / Place 最小版。
- GEDCOM対応。
- 親等計算。

### v0.8.0タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.8.0
git push origin v0.8.0
```


## 公開URL

- GitHub Pages: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- v0.8.0 キャッシュ回避確認: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.8.0>
- v0.7.0 キャッシュ回避確認: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.7.0>

## 主な機能

- GitHub Pages 公開対応（Vite `base: '/Kakeizu-Studio/'`）
- Dexie によるローカル永続保存
- 単一CSV（`family_simple.csv`）インポート、CSVプレビュー、検証、列マッピング
- 日本語列名CSVの自動マッピング候補
- Person / Union / ParentChildRelation の管理
- Source / Citation の管理、資料一覧、人物単位Citation、Event単位Citation、関係単位Citation UI
- JSONバックアップ出力・復元（eventsと関係Citationを含む。旧1.0/1.1 JSONも `events` なしとして復元）
- 標準CSVセット（複数CSV + `manifest.json`）のZIPエクスポート、ZIPインポート、複数ファイル直接インポート
- SVG家系図表示、人物クリック選択、出典あり人物の印、選択人物ハイライト
- 拡大・縮小・全体表示・リセット・ドラッグ移動
- 人物詳細編集、人物に紐づくEvent（出生・死亡・婚姻・転籍・入籍・除籍など）の追加・編集・削除
- Person / Event / Source / Citation の一覧・検索・フィルタ
- ValidationPanelの検証結果からperson / event / union / relation対象へ移動する修正導線
- 人物詳細の「関係の出典」から親子関係・夫婦関係のCitationを表示・追加・編集・削除
- 戸籍入力モードで父・母・配偶者を登録した際の関係Citation自動作成
- 人物詳細の「関係の出典」から親子関係・夫婦関係を編集・削除
- CSV / JSON / PNG / PDF / SVG 出力（PNG/PDF系ライブラリは dynamic import）
- データ検証結果パネル（出典なし、未確認、低確度、参照先不明、自己参照、日付矛盾、年齢警告）


## v0.7.0: CSVインポート本格化

v0.7.0では、CSVインポートの取り込み前確認、取込方式選択、external_id照合、参照先不明検出、標準CSVセット検証、ImportBatch履歴、インポート結果レポートを強化しました。v0.7第1〜第9フェーズの内容を正式版の実装内容として整理し、JSON backup `schema_version`、Dexie schema version、DBテーブル、標準CSVセット構造は変更していません。

- CSVインポート現状棚卸し: 既存のかんたんCSV、標準CSVセット、DB保存、JSONバックアップ、未対応事項を `docs/csv_import_audit_v0.7.md` に整理しました。
- インポート結果プレビュー強化: 正常行 / 警告行 / エラー行、warning / error件数、取り込み予定件数、issue一覧を取込前に確認できます。
- 取込方式選択: `replace_all` / `append_new` / `update_by_external_id` / `skip_existing` / `add_as_new_ids` を表示し、全置換以外はプレビューのみとして明示しました。
- 既存external_id照合強化: かんたんCSVの `person_id` と標準CSVセット各行の `external_id` を既存データと照合し、新規候補、既存一致候補、CSV内重複、external_idなしを表示します。
- 参照先不明・仮人物作成方針: `father_id` / `mother_id` / `spouse_ids` や標準CSVセット内参照の未解決を表示し、`warn_and_skip` / `block_import` / `create_placeholder_preview` をプレビューで比較できます。
- 標準CSVセット検証強化: manifest、必須ファイル、必須列、重複ID、参照整合、列挙値、fileName + rowNumber単位のwarning/error集計を整理しました。`events.csv` は既存互換のため任意扱いです。
- ImportBatch最小版: 既存のImportBatch / `importBatches`テーブルを活かし、取込成功時の最小履歴を表示します。全置換保存フローに合わせ、取込後は最新ImportBatchのみ残ります。
- インポート結果レポート: 直近取込結果として、件数、warning/error、参照先不明、仮人物候補、external_id照合、次に確認することを画面表示します。詳細レポートはDB永続保存しません。
- v0.7全体仕上げ確認: 第1〜第8フェーズのつながりを確認し、READMEと棚卸しドキュメントをv0.7全体説明として整理しました。

### v0.7.0 確認項目

- [ ] かんたんCSVを読み込める。
- [ ] かんたんCSVの取込前プレビューが表示される。
- [ ] 取込方式を選択できる。
- [ ] 実行可能なのは `replace_all` + `warn_and_skip` + errorなし のみ。
- [ ] `preview_only`方式は実行できない。
- [ ] `person_id` と既存 `external_id` の照合結果が表示される。
- [ ] `father_id` / `mother_id` / `spouse_ids` の参照先不明が表示される。
- [ ] 標準CSVセットを読み込める。
- [ ] 標準CSVセットの manifest / 必須ファイル / 必須列 / 重複ID / 参照整合 / 列挙値検証が動作する。
- [ ] `events.csv` は任意扱いである。
- [ ] ImportBatch履歴が表示される。
- [ ] インポート結果レポートが表示される。
- [ ] 既存の人物一覧・Event一覧・Source/Citation一覧が壊れていない。
- [ ] 家系図表示が壊れていない。
- [ ] PNG / PDF / SVG出力が壊れていない。
- [ ] JSONバックアップが壊れていない。
- [ ] 標準CSVセット出力が壊れていない。
- [ ] GitHub Pages確認URL <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.7.0> で公開版を確認できる。

### v0.7.0 時点の未対応事項

- 全置換以外の実保存。
- external_idによる実更新。
- 既存スキップの実保存。
- 別ID追加の実保存。
- 仮人物の実保存。
- 参照先不明の自動補完。
- ImportBatch詳細画面。
- ImportBatch削除・編集。
- 詳細レポートのDB永続保存。
- 行単位ログ保存。
- preview_only方式の履歴保存。

### v0.7.0タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.7.0
git push origin v0.7.0
```

## v0.6.0: 検索・一覧・検証結果からの修正導線

v0.6.0は、「検索・一覧・検証結果からの修正導線」を正式版として固定したリリースです。共通の `target_type` / `target_id` 選択基盤、Person / Event / Source / Citation の一覧・検索、ValidationPanelから修正対象へ向かう導線、一覧系UIの見た目整理をまとめました。

- 選択・ジャンプ基盤: `SelectableTargetType` / `SelectableTarget`、`resolveSelectableTargetToPersonId`、`validationIssueToSelectableTarget`、App側 `selectTarget` を追加し、person / event / union / relation から人物詳細へ誘導する共通選択基盤を用意しました。source / citation は専用詳細画面がないため安全に扱います。
- Person一覧・検索: `PersonListPanel` を追加し、氏名・かな・旧姓・称号・職業・備考の検索、gender / confidence / review_status / 出典ありなしフィルタ、人物クリックによる人物詳細移動、件数表示・0件表示を整理しました。
- Event一覧: `EventListPanel` を追加し、event_typeフィルタ、日付・説明・備考・関連人物名検索、関連人物名表示、Eventクリックによる対象移動、件数表示・0件表示を整理しました。
- Source / Citation一覧: `SourceCitationPanel` を追加し、Source一覧、Citation一覧、source_typeフィルタ、Citation target_typeフィルタ、Source / Citation検索、Citation対象名表示、Citationクリックによる対応済み対象への移動、Sourceクリックによる関連Citation絞り込みを整理しました。
- ValidationPanelから修正対象への移動: `ValidationPanel` に `onSelectTarget` を接続し、person / event / union / relation issueから対象人物へ誘導する「対象へ移動」ボタンを追加しました。source / citation issueは現時点では対象へ移動不可として表示します。
- 一覧・検索UI仕上げ: 共通list系CSS、検索欄・フィルタ・件数表示・0件表示の見た目、左側パネル縦長化、スマホ幅での最低限の折り返し、Source / Citation issue導線表示を仕上げました。
- JSON backup `schema_version`、Dexie schema version、DBテーブル、標準CSVセット構造は変更していません。
- 仕様は `docs/specification.md` を現行の参照先とします。

### v0.6.0確認項目

- [ ] アプリが起動する。
- [ ] サンプルCSVを取り込める。
- [ ] 家系図が表示される。
- [ ] v0.5.0の表示密度 compact / standard / detailed が維持されている。
- [ ] PNG / PDF / SVG出力が維持されている。
- [ ] Person一覧が表示される。
- [ ] Person一覧で検索・フィルタできる。
- [ ] Person一覧クリックで人物詳細へ移動できる。
- [ ] Event一覧が表示される。
- [ ] Event一覧でevent_typeフィルタ・検索ができる。
- [ ] Event一覧クリックで対象へ移動できる。
- [ ] Source / Citation一覧が表示される。
- [ ] Source種別フィルタが使える。
- [ ] Citation target_typeフィルタが使える。
- [ ] Citation対象名が表示される。
- [ ] Citationクリックで対象へ移動できる。
- [ ] Sourceクリックで関連Citationを絞り込める。
- [ ] ValidationPanelの対象へ移動ボタンが表示される。
- [ ] ValidationPanelからperson / event / union / relation対象へ移動できる。
- [ ] Source / Citation issueは現時点では対象へ移動不可として表示される。
- [ ] 左側パネルが縦長でも最低限使える。
- [ ] スマホ幅でも一覧・検索UIが大きく崩れない。
- [ ] JSONバックアップ / 復元が維持されている。
- [ ] CSV / 標準CSVセット入出力が維持されている。

### v0.6.0時点の未対応事項

- Event詳細編集UIへの本格ジャンプは未対応です。
- Source詳細画面は未対応です。
- Citation詳細画面は未対応です。
- Source / Citation issueからの直接ジャンプは未対応です。
- 一括編集は未対応です。
- 本格ソートは未対応です。
- ページネーションは未対応です。
- 仮想スクロールは未対応です。
- Project / ViewSetting / ExportSettingは未対応です。
- Name / Placeは未対応です。
- CSVインポート本格改修は未対応です。
- GEDCOMは未対応です。
- OCR / AI戸籍読み取りは未対応です。
- ELK.js / React Flowは未対応です。

### v0.6.0タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.6.0
git push origin v0.6.0
```

## v0.5.0: 家系図表示・出力の見栄え強化

v0.5.0では、既存のSVG家系図ビューをベースに、人物ノード、関係線、出力用見た目設定、PNG/PDF/SVG出力導線の見栄えを正式リリース向けに強化しました。新しいDBテーブルや本格レイアウトエンジンは追加せず、JSON backup の `schema_version` と Dexie schema version は従来のまま維持しています。

### 第1フェーズ: 人物ノード表示強化

- 家系図ビューの表示密度を `compact` / `standard` / `detailed` で切り替えられます。初期値は `standard` です。
- `compact` は氏名中心の省スペース表示、`standard` は氏名・生没年・最小ステータス、`detailed` は氏名・生没年・称号/肩書・確度・確認状態・出典状態を表示します。
- 人物ノードでは `birth_date_text` / `death_date_text` から生没年を `1900 - 1970`、`1900 - `、`? - 1970` のように確認できます。
- Person Citation の有無、`confidence`、`review_status` をノード上で確認できます。
- 出典なし、未確認、低確度（要確認）、異説ありは、文字表示とノード強調スタイルで見分けやすくしています。

### 第2フェーズ: 関係線表示強化

- ParentChildRelation の `relation_type` に応じて親子線の線種を変えます。
- 実親子は実線、養親子・特別養親子・認知は破線系、継親子・養育は点線系、不明は控えめな線、異説ありは警告色の線として見分けやすくしています。
- Union の `union_type` / `status` / `end_reason` に応じて夫婦・パートナー線の見た目を変えます。
- 婚姻は通常線、パートナーは破線、側室・内縁は点線系、不明・その他は控えめな線として表示します。
- 離婚、死別、終了済み関係は、色や破線で通常の婚姻関係と見分けやすくしています。
- ParentChildRelation / Union の `confidence` と `review_status` も線の見た目に反映し、要確認、異説あり、未確認の関係を線上で把握できるようにしています。
- Unionノードにも、離婚、死別、終了済み、要確認、異説ありを控えめに反映します。
- 家系図ビュー付近に、実親子、養親子、継親子、婚姻、離婚/終了、異説ありの最小限の凡例を表示します。

### 第3フェーズ: 出力用見た目設定

- 家系図ビュー付近の「出力用表示」で、出力用タイトルを表示できます。
- タイトル表示ON/OFFを切り替えられ、タイトル欄が空の場合は既定タイトルの「家系図」を表示します。
- 関係線凡例の表示ON/OFFを切り替えられます。
- 背景を `white`（白）/ `transparent`（透明風）/ `soft`（淡色）から選べます。
- `transparent` は画面上で透明風と分かる市松模様のプレビューであり、本当の透過PNG生成には未対応です。
- タイトル、家系図SVG、凡例、背景スタイルは既存の家系図表示領域内に配置しており、現在表示中の設定がPNG/PDF出力対象DOMに反映される構成です。
- 家系図操作ツールバー、表示密度セレクト、出力用見た目設定UIなどの操作UIには `data-html2canvas-ignore="true"` を付け、PNG/PDF出力対象から除外します。

### 第4フェーズ: SVG出力最小版

- PNG/PDF出力ボタンと同じヘッダーの出力導線に「SVG出力」ボタンを追加しました。
- PNG/PDF/SVG出力が利用でき、表示中の家系図領域を `kakeizu.png` / `kakeizu.pdf` / `kakeizu.svg` として保存できます。
- SVG出力には、出力タイトル、家系図SVG本体、凡例、背景スタイルを含めます。
- SVG出力は、家系図表示領域のDOMをcloneし、操作UIを取り除いたうえで `foreignObject` にHTML/SVG断片を入れる最小版です。
- 家系図操作ツールバー、表示密度セレクト、出力用見た目設定UIなどの操作UIはSVG出力文字列からも除外します。
- 背景は `white` では白い背景rect、`soft` では淡色背景rect、`transparent` ではSVG背景を透明として出力します。

#

## v0.5.0 の制限と未対応

- SVG出力は `foreignObject` を使うため、SVGビューアによってHTML部分の再現性に差があります。
- SVG出力で外部CSSの完全な取り込みは未対応です。家系図表示に必要な最小限のstyleのみSVG内へ埋め込んでいます。
- SVG出力は印刷品質向けの完全調整には未対応です。
- `transparent` 背景はSVG上では透明扱いであり、画面上の市松模様プレビューとは完全一致しません。
- 本格的な用紙サイズ指定、ページ分割、出典一覧付き出力は未対応です。
- ELK.js / React Flow / 複数ビュー本格対応、縦型・横型・直系祖先図・子孫図などの本格ビュー切替は未対応です。
- Project / ViewSetting / ExportSetting への永続化は未対応です。
- 新しいDBテーブル、JSON schema_version 変更、Dexie schema version 変更は行っていません。

## v0.5.0 確認用URL

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.6.0>

## v0.5.0 確認項目

- アプリが起動する
- サンプルCSVを取り込める
- 家系図が表示される
- 戸籍入力モードで人物・Event・関係Citationを作成できる
- 人物詳細でEventを追加・編集・削除できる
- 人物詳細で関係Citationを追加・編集・削除できる
- 人物詳細で親子関係・夫婦関係を編集・削除できる
- データ検証結果パネルが表示される
- error / warning / info 件数が表示される
- severity / category / target_type で検証結果を絞り込める
- 日付・年齢チェックのissueが表示される
- JSONバックアップを出力できる
- 標準CSVセットをエクスポートできる
- 表示密度 compact / standard / detailed を切り替えられる
- 人物ノードに生没年・出典有無・確度・確認状態が表示される
- 親子線・夫婦/パートナー線の種類や状態が見分けられる
- 関係線凡例が表示される
- 出力用タイトル、凡例ON/OFF、背景切替が機能する
- PNG / PDF / SVG 出力ボタンが表示される
- PNG/PDF/SVG出力時に操作UIが出力対象に混ざらない

## v0.4.0: 検証エンジン最小版

v0.4.0では、UI画面を大きく作らず、DBやDexieへ直接依存しない純粋関数 `validateFamilyData` による検証エンジン最小版を追加しました。package.json の version は `0.4.0`、JSON バックアップの schema_version は必要がなければ `1.2` のままです。

- 検証対象は Person / Event / Union / ParentChildRelation / Citation です。Source は Citation の `source_id` 参照先として確認します。
- Person / Event / Union / ParentChildRelation に対応する Citation が1件もない場合、出典なしとして warning を返します。
- Person / Event / Union / ParentChildRelation の `review_status === "unreviewed"` は、確認作業が必要な項目として warning を返します。既存データでも見落としにくいことを優先し、最小版では info ではなく warning として扱います。
- `confidence === "uncertain"` または `confidence === "disputed"` は低確度として warning を返します。`likely` は今回の警告対象外です。
- Union の partner、ParentChildRelation の parent / child / union、Event の target、Citation の source / target が存在しない場合、参照先不明として error を返します。
- Citation の `target_type: "name"` / `target_type: "place"` は Name / Place モデルが未実装のため、現時点では参照先不明 error にしません。
- ParentChildRelation の `parent_id === child_id`、Union の `partner1_id === partner2_id` は自己参照として error を返します。
- Person の `birth_date_text` / `death_date_text` と親子関係に対して、4桁の西暦年が含まれる場合だけ最小限の日付矛盾を検出します。死亡年が出生年より前、子の出生年が親の出生年より前は error、子の出生時に親が10歳未満または80歳超は warning です。
- 和暦（例: 明治33年、昭和10年）や曖昧日付の本格解析、厳密な月日比較は未対応です。
- 検証結果は error、warning、info の severity 順で返します。

### v0.4.0: 検証結果UI最小版

v0.4.0では、現在アプリ内で保持している Person / Event / Union / ParentChildRelation / Source / Citation を `validateFamilyData` に渡し、その結果を既存UI内の簡素な「データ検証結果」パネルで確認できるようにしました。検証結果は保存データではなく、現在のアプリデータから都度算出します。

- `validateFamilyData` の結果を画面上で確認できます。
- error / warning / info / total の件数を表示できます。
- issue一覧で severity、カテゴリ、タイトル、メッセージを確認できます。
- issue一覧で `target_type` / `target_id` / `message` を確認できます。
- 対象が Person の場合は、IDだけでなく人物名も表示します。
- 検証結果が0件の場合は「問題は見つかりませんでした。」と表示します。
- MVPでは画面負荷を避けるため、issue一覧は最初の50件まで表示します。
- MVPでは issue から対象へのジャンプ、issueクリックによる人物選択、自動修正は未対応です。
- 大量issue向けの高度な検索・フィルタUIは未対応です。
- 今回は検証ロジックの大幅追加、DBテーブル追加、JSON schema_version 変更は行いません。

### v0.4.0: 検証結果フィルタ・絞り込み最小版

v0.4.0では、検証ロジックを大きく増やさず、`validateFamilyData` の結果を確認する `ValidationPanel` に最小限の絞り込みUIを追加しました。

- severity フィルタで、すべて / error / warning / info に絞り込めます。
- category フィルタで、現在の issue に含まれる `missing_citation`、`unreviewed`、`low_confidence` などのカテゴリに絞り込めます。
- target_type フィルタで、現在の issue に含まれる `person`、`event`、`union`、`relation`、`citation` などの対象種別に絞り込めます。
- フィルタ適用後の「条件一致」件数と全体件数を確認できます。
- 大量issueの場合は、フィルタ後の結果に対して最初の50件を表示します。
- issueクリックで対象へジャンプする機能はまだ未対応です。
- 自動修正は未対応です。

### v0.4.0: 日付・年齢チェック強化最小版

v0.4.0では、`validateFamilyData` の4桁西暦年ベースの日付・年齢チェックを少し強化しました。

- 日付文字列から最初に見つかった4桁の西暦年を抽出して検証します。
- `1900`、`1900年`、`1900-01-01`、`1900/01/01`、`西暦1900年`、`約1900年`、`1900頃`、`1900年頃`、`c.1900`、`ca.1900` などから `1900` を抽出できます。
- Person の `death_date_text` の年が `birth_date_text` の年より前の場合、死亡年が出生年より前の `date_inconsistency` error として検出できます。
- ParentChildRelation では、子の出生年が親の出生年より前の場合は `date_inconsistency` error、子の出生時に親が10歳未満または80歳超の場合は `age_warning` warning として検出できます。
- Union では、離婚年が婚姻年より前、終了年が婚姻年より前の場合を `date_inconsistency` error として検出できます。終了年が離婚年より前の場合は、終了日の意味が離婚日とは別の可能性を考慮し `date_inconsistency` warning として検出します。
- Event が `target_type: "person"` の場合、birth 以外の Event が人物の出生年より前、death 以外の Event が人物の死亡年より後にあるケースを `date_inconsistency` warning として検出できます。
- 追加issueは既存の `ValidationPanel` で表示でき、severity / category / target_type フィルタで `error`、`warning`、`date_inconsistency`、`age_warning`、`person`、`relation`、`union`、`event` として確認できます。
- 和暦の本格変換、曖昧日付の高度解析、月日単位の厳密比較は未対応です。

## v0.5.0 タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

```bash
git tag v0.5.0
git push origin v0.5.0
```

GitHub上でReleaseを作る場合は、tag `v0.5.0` を使ってReleaseを作成してください。

## v0.3.0: 関係単位Citation UI / 関係削除UI / 関係編集UI

人物詳細画面の「関係の出典」で、人物そのものではなく親子関係（ParentChildRelation）や夫婦関係（Union）に対する根拠を管理できます。

### 関係単位Citation UI

- 親子関係には `target_type: "relation"` / `target_id: ParentChildRelation.id` のCitationを付けられます。
- 夫婦関係には `target_type: "union"` / `target_id: Union.id` のCitationを付けられます。
- Source違いの複数Citationを表示でき、Citationごとに編集・削除できます。
- 同一Source/Relation、同一Source/UnionのCitationは重複作成せず、既存Citationを更新します。
- Sourceが欠損したCitationは「参照先資料なし」として安全に表示します。
- 戸籍入力モードで父・母を登録した場合は親子関係Citation、配偶者を登録した場合は夫婦関係Citationを自動作成または更新します。

### 関係削除UI

- 親子関係（ParentChildRelation）は「この親子関係を削除」ボタンから削除できます。
- 夫婦関係（Union）は「この夫婦関係を削除」ボタンから削除できます。
- 削除前には確認メッセージが表示され、キャンセルした場合は何も削除されません。
- 親子関係を削除すると、その関係に紐づく `target_type: "relation"` / `target_id: ParentChildRelation.id` のCitationも同時に削除されます。
- 夫婦関係を削除すると、そのUnionに紐づく `target_type: "union"` / `target_id: Union.id` のCitationも同時に削除されます。
- 関係削除はPerson自体やEventには影響しません。

### 関係編集UI

- 親子関係（ParentChildRelation）は `relation_type`、開始日、終了日、確度、レビュー状態、メモを編集できます。
- 夫婦関係（Union）は `union_type`、婚姻日、離婚日、終了日、終了理由、状態、確度、レビュー状態、メモを編集できます。
- 親・子・配偶者の相手変更、親子関係の組み替え、夫婦関係の相手差し替えは未対応です。
- 関係編集はPerson自体を編集するものではありません。人物名、生没日、称号などのPerson基本情報とは独立しています。
- 関係編集はEventには影響しません。marriage Eventやadoption EventからUnion / ParentChildRelationを自動作成・同期する機能も未対応です。
- 編集後は `updated_at` を更新し、`created_at` は維持します。人物詳細・家系図表示・JSONバックアップ・標準CSVセット出力に反映されます。

### v0.3.0 確認項目

- アプリが起動する
- サンプルCSVを取り込める
- 家系図が表示される
- 戸籍入力モードで人物・Event・関係Citationを作成できる
- 人物詳細でEventを追加・編集・削除できる
- 人物詳細で親子関係Citationを追加・編集・削除できる
- 人物詳細で夫婦関係Citationを追加・編集・削除できる
- 人物詳細で親子関係を編集・削除できる
- 人物詳細で夫婦関係を編集・削除できる
- JSONバックアップを出力できる
- 標準CSVセットをエクスポートできる
- 標準CSVセットに `events.csv` が含まれる
- 標準CSVセットの `parent_child_relations.csv` / `unions.csv` に関係属性列が含まれる

## v0.2.0: 戸籍入力モード / Eventモデル

戸籍入力モードは、戸籍・除籍・改製原戸籍などの資料を見ながら人物情報を入力するための最小入力モードです。戸籍を完全に構造化するのではなく、既存の Source / Citation 機能を活かして、資料を根拠として人物に紐づけることを目的にしています。

- 戸籍資料は Source として登録します。資料種別は現在戸籍、除籍、改製原戸籍、その他を選べます。
- 戸籍資料を選択した状態で人物を追加・更新すると、その人物に対する Citation が自動作成されます。
- 既存人物更新時は、空欄の入力項目では既存値を消さず、入力された項目だけを更新します。
- 同じ Source と Person の Citation がすでにある場合は重複作成せず、created_at を維持して既存Citationを更新します。
- 父・母・配偶者を任意で選択し、ParentChildRelation や Union を同時に作成できます。既存の同一関係がある場合は重複作成しません。
- 人物単位Citationに加えて、任意作成した出生・死亡Eventと追加Eventにも選択中戸籍資料へのCitationを自動付与できます。
- v0.3.0では、父・母を登録した場合は `target_type: "relation"` / `target_id: ParentChildRelation.id`、配偶者を登録した場合は `target_type: "union"` / `target_id: Union.id` のCitationも自動作成または更新します。
- 出生Eventを作成する / 死亡Eventを作成するチェックを使うと、birth_date_text / death_date_text から人物紐づきEventを任意作成できます。既存の同一Person・event_type・date_textのEventは重複作成しません。
- 「追加Event」セクションから、出生・死亡以外の戸籍上の出来事を人物に紐づくEventとして追加できます。対応種別は marriage（婚姻）、divorce（離婚）、adoption（養子縁組）、recognition（認知）、entry_registry（入籍）、removal_registry（除籍）、transfer_registry（転籍）、name_change（氏名変更）、residence（居住）、occupation（職業）、title（称号・肩書）、other（その他）です。
- 追加Eventは、Event種別を選択し、日付テキスト・場所・説明・メモのいずれかを入力した場合だけ作成されます。同一Person・target_type・event_type・date_text・place_text・descriptionのEventが既にある場合は重複作成しません。
- 追加Eventは人物に紐づく出来事として保存されます。現時点では、追加Eventから人物基本情報や家系図関係（Union / ParentChildRelation）へ自動反映しません。
- OCRやAI読み取り、戸籍画像添付には未対応です。戸籍入力モードは手入力支援です。
- 戸籍入力モードで作成した Person / Source / Citation / Event / ParentChildRelation / Union は、JSONバックアップと標準CSVセットに含まれます。

### Eventモデル最小版

v0.2.0では、人物・関係そのものとは別に「出来事」を記録する Event モデルを追加しています。

- Eventは `event_type`、`target_type`、`target_id`、日付テキスト、場所、説明、確度、メモなどを持ちます。
- 現在のUIでは人物詳細画面から人物に紐づくEventを追加・編集・削除できます。
- EventにはEvent単位Citationを紐づけられます。同じSource/EventのCitationは重複作成せず更新します。
- Event削除時は、そのEventに紐づくEvent Citationも削除します。
- 未知のEvent種別やSource欠損Citationがあっても、画面が落ちないように安全表示します。
- 家系図ノード上にはEventを表示しません。家系図上の表示はv0.1.0と同じく人物・Union・親子関係が中心です。
- Personの `birth_date_text` / `death_date_text` と出生・死亡Eventは自動同期しません。どちらかを編集しても、もう一方は自動更新されません。
- marriage EventからUnionを自動作成したり、adoption EventからParentChildRelationを自動作成したりする機能は未対応です。

## 使い方

### 1. 単一CSVで取り込む

1. 左パネルの「CSVファイルを選択」、textarea貼り付け、または「サンプルCSVを読み込む」でCSVを入力します。
2. 「列マッピングへ進む」でCSV列をKakeizu Studio標準項目へ対応付けます。不要な列は「取り込まない（無視）」を選べます。
3. プレビューで行ごとの「正常」「警告あり」「エラーあり」を確認します。
4. 検証結果で warning / error 件数、人物数、Union数、親子関係数を確認します。
5. error がない場合のみ「家系図・資料・出典を置き換えてインポート実行」できます。warning のみの場合は確認ダイアログ後に反映できます。

単一CSVインポートは手軽な人物投入用です。Source / Citation / Event は単一CSVに含まれません。実行すると現在の人物・夫婦関係・親子関係・資料・出典・Event・インポート履歴はCSVの内容で全置き換えされ、既存の資料・出典・Eventも削除されます。資料・出典・Eventを保持した移行には、JSONバックアップまたは標準CSVセットを使ってください。

「サンプルCSVをダウンロード」から `kakeizu_sample_family.csv` を保存できます。「ChatGPT用プロンプトをコピー」も利用できます。

### 2. 標準CSVセットで出し入れする

標準CSVセットは、人物・夫婦関係・親子関係・資料・出典・Eventをまとめて移行・外部編集するための形式です。

- 「標準CSVセットをエクスポート」で `kakeizu_standard_csv_set.zip` を出力できます。
- Kakeizu Studioが出力したZIPは「標準CSVセットZIPをインポート」から再インポートできます。
- Excel等で編集する場合は、ZIPを展開してCSVを編集し、再ZIP化せず `manifest.json` と6つのCSVを「標準CSVセットの複数ファイルをインポート」からまとめて選択する方法を推奨します。
- インポート前にプレビューと issue 一覧を表示します。error がある場合は反映不可、warning のみの場合は確認後に反映できます。
- 反映時は人物・夫婦関係・親子関係・資料・出典・Event・インポート履歴を全置き換えします。

現時点のZIP読込は**無圧縮ZIP前提**です。Kakeizu Studioが出力したZIPは再インポート可能ですが、外部ツールで再圧縮したZIPは読めない場合があります。その場合は複数ファイル直接インポートを使ってください。

### 3. JSONバックアップを使う

- 「JSONバックアップ」でアプリ内部形式の `kakeizu_backup.json` を出力します。
- 「JSON復元」で現在の人物・Union・親子関係・資料・出典・Event・インポート履歴を全置き換え復元します。
- v0.2.0以降のJSONバックアップは `schema_version: "1.2"` として `events` を含みます。Event Citationは `citations` 内に `target_type: "event"` として保存されます。
- v0.3.0の関係単位Citationも新規フィールドを追加せず、JSONバックアップの `citations` 配列に保存されます。親子関係は `target_type: "relation"` / `target_id: ParentChildRelation.id`、夫婦関係は `target_type: "union"` / `target_id: Union.id` です。
- 旧形式バックアップのように `sources` / `citations` / `events` が存在しないJSONでも、空配列として扱うため復元できます。

### 4. 資料・出典を登録する

- 左パネルの「資料一覧」から資料（Source）を追加・編集・削除できます。
- 資料種別は「現在戸籍」「除籍」「改製原戸籍」「Web」「書籍」「聞き取り」「AI生成」「その他」から選べます。
- 資料を削除すると、その資料に紐づく人物出典（Citation）も削除されます。
- 家系図ノードまたは人物一覧から人物を選択し、右側の人物詳細パネルで人物単位の出典を追加・編集・削除できます。
- Sourceが欠損したCitationは「参照先資料なし」として安全に表示します。人物・Event・親子関係・夫婦関係のCitation表示で同じ扱いです。

### 5. 家系図ビューを操作する

- 家系図ビューはSVGベースのMVP簡易レイアウトです。
- 人物ノード、Unionノード、配偶者線、親子線を表示します。
- 人物ノードをクリックすると右側の人物詳細パネルが更新され、選択中人物はオレンジでハイライトされます。
- 出典がある人物は、人物詳細タイトル・人物一覧・家系図ノード上の印で判別できます。
- 「＋ 拡大」「− 縮小」で表示倍率を変更できます。
- 「全体表示」は家系図全体が見える基準表示に戻します。
- 「リセット」は拡大率とドラッグ移動量を初期状態に戻します。
- SVG上をドラッグすると表示位置を移動できます。
- 空データ時はCSVインポートを促す案内を表示します。

## データ形式

### 単一CSV

標準CSVヘッダーは以下です。

```csv
person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
```

日本語列名でも自動で候補マッピングします。例: `人物ID` / `個人ID` は `person_id`、`名前` / `氏名` / `人物名` は `name`、`父` / `父親` は `father_id`、`母` / `母親` は `mother_id`、`生年` / `生年月日` は `birth_date`、`配偶者` / `配偶者ID` は `spouse_ids` に対応します。

- **error**: `person_id` / `name` 不足、CSVパース失敗、同一人物を配偶者・親に指定、親子循環など、データ破損につながる問題です。error が1件でもあるCSVは取り込めません。
- **warning**: 存在しない親ID・配偶者IDなど、確認は必要だが取り込み自体は可能な問題です。warning のみの場合は確認ダイアログに同意後に取り込めます。

### 標準CSVセット

標準CSVセットZIP、または複数ファイル直接インポートでは以下の6ファイルを使います。CSVはUTF-8 BOM付きで出力されます。

```text
manifest.json
persons.csv
unions.csv
parent_child_relations.csv
sources.csv
citations.csv
events.csv
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
    "citations.csv",
    "events.csv"
  ]
}
```

主な列は以下です。

```csv
persons.csv: id,external_id,name,gender,birth_date,death_date,generation_no,title,note,confidence,created_at,updated_at
unions.csv: id,external_id,partner1_id,partner2_id,union_type,marriage_date_text,divorce_date_text,end_date_text,end_reason,status,confidence,review_status,note,created_at,updated_at
parent_child_relations.csv: id,parent_id,child_id,relation_type,start_date_text,end_date_text,confidence,review_status,note,created_at,updated_at
sources.csv: id,external_id,source_type,title,author_or_issuer,issued_date_text,obtained_date,repository,honseki_text,head_of_registry,registry_type,source_text,url,privacy_level,note,import_batch_id,created_at,updated_at
citations.csv: id,external_id,source_id,target_type,target_id,page_or_location,quote_text,interpretation,confidence,note,import_batch_id,created_at,updated_at
events.csv: id,external_id,event_type,target_type,target_id,date_text,date_from,date_to,place_text,description,confidence,review_status,note,import_batch_id,created_at,updated_at
```

一部の列名は内部フィールドへ対応付けています。たとえば `persons.csv` の `name` は `Person.display_name`、`birth_date` は `Person.birth_date_text`、`title` は `Person.rank_title`、`unions.csv` の `marriage_date_text` は `Union.marriage_date_text` として扱います。旧標準CSVセットの `start_date` / `end_date` も読み込み時は、`unions.csv` では `marriage_date_text` / `end_date_text`、`parent_child_relations.csv` では `start_date_text` / `end_date_text` として扱います。

### JSONバックアップ

JSONバックアップはアプリ内部形式そのものです。v0.5.0でも `schema_version` は `1.2` のままで、`persons` / `unions` / `parent_child_relations` / `import_batches` / `sources` / `citations` / `events` をまとめて保持します。旧 `1.0` / `1.1` JSONで `events` が存在しない場合は空配列として扱います。普段のバックアップや、Kakeizu Studio間で完全に復元したい場合に向いています。

## GitHub Pages公開設定

- 公開URLは <https://kgymk1-hub.github.io/Kakeizu-Studio/> です。
- GitHub Pagesのプロジェクトページで公開するため、`vite.config.ts` に `base: '/Kakeizu-Studio/'` を設定しています。
- `npm run build` 後は、`dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっていることを確認してください。`/assets/...` のままだとプロジェクトページ配下で404になります。
- `manifest.json` とSVGアイコン参照も `/Kakeizu-Studio/` 配下です。
- 公開ページが真っ白画面になる場合は、以下を確認してください。
  - ブラウザDevToolsのNetworkタブで `/assets/...` が404になっていないか確認する。
  - `dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっているか確認する。
  - `manifest.json` や `/Kakeizu-Studio/icons/icon.svg` が404になっていないか確認する。
  - GitHub ActionsのPagesデプロイが成功しているか確認する。
  - ブラウザやService Workerのキャッシュを避けるため、`https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.8.0` のようにクエリを付けて開く。

## 既知の制限

- 親・子・配偶者の相手変更は未対応です。
- 関係編集のUndoは未対応です。
- Person削除は未対応です。
- EventからPerson基本情報への自動同期は未対応です。
- marriage EventからUnion自動作成は未対応です。
- adoption EventからParentChildRelation自動作成は未対応です。
- Timeline表示、Event検索・フィルタは未対応です。
- レイアウトはMVP簡易レイアウトであり、複雑な再婚・養子・異説・大規模家系図は将来改善予定です。
- ZIP読込は現時点では無圧縮ZIP前提です。
- 外部編集後は再ZIP化より複数ファイル直接インポートを推奨します。
- Eventは人物詳細パネルで確認・編集できますが、家系図ノード上にはまだ表示しません。Personのbirth/deathテキストとEventは現時点では自動同期しません。戸籍入力モードの追加Eventも人物基本情報や家系図関係へ自動反映しません。
- v0.3.0では、人物詳細画面に「関係の出典」セクションを追加しました。選択中人物が関係する親子関係（ParentChildRelation）と夫婦関係（Union）について、Citationの確認・追加・編集・削除ができます。同じ関係にSource違いのCitationが複数ある場合はすべて一覧表示し、各Citationごとに編集・削除できます。同一Source/Relation、同一Source/UnionのCitationは重複作成せず既存Citationを更新します。
- Citation target_typeの使い分けは、`person`: 人物、`event`: 出来事、`relation`: 親子関係、`union`: 夫婦関係です。`name` / `place` は将来用で、今回のUI対象外です。
- 関係単位CitationはJSONバックアップと標準CSVセットの `citations` / `citations.csv` に含まれます。標準CSVセットのインポート時には `relation` は既存ParentChildRelation、`union` は既存Unionを参照しているか検証します。
- 関係削除UIに対応しています。人物詳細画面の「関係の出典」から親子関係・夫婦関係を削除でき、対象関係のCitationも同時に削除します。Person自体とEventには影響しません。
- 戸籍画像添付は未対応です。
- OCR / AI戸籍読み取りは未対応です。
- GEDCOMは未対応です。
- Shift_JIS CSV自動判定は未対応です。CSVはUTF-8で保存してください。
- PWAとしての高度なオフライン対応は今後調整します。
- Excel xlsx の直接入出力には未対応です。CSVを利用してください。

## 今後の予定

- 複雑な家系図レイアウトへの対応強化
- 関係単位Citationのさらなる強化、Eventの高度検索・タイムライン、場所、氏名単位CitationのUI追加
- GEDCOM、OCR、AI読み取り、メディア添付の検討
- PWA / オフライン体験の改善

## 開発コマンド

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

### v0.7.0 第2フェーズ: インポート結果プレビュー強化

- CSVインポート本格化に向けて、取り込み前のインポート結果プレビューを強化しました。
- かんたんCSVでは、正常行 / 警告行 / エラー行、warning / error件数、取り込み予定件数、現在の取込方式が全置換であることを表示します。
- 標準CSVセットでは、ファイル別件数、`manifest.json` の有無、Person / Union / ParentChildRelation / Source / Citation / Event の取り込み予定件数、issue一覧の表示を整理しました。
- 第2フェーズ時点ではプレビュー表示の整理に集中し、DB保存方式、JSON `schema_version`、Dexie schema versionは変更していません。

### v0.7.0 第4フェーズ: 既存external_id照合強化

- CSVインポートのプレビューで、取り込み予定データの `external_id` と既存データの `external_id` を照合できるようにしました。
- かんたんCSVでは `person_id` を `Person.external_id` として扱い、新規候補、既存一致候補、CSV内重複、`external_id` なしをプレビュー表示します。
- 標準CSVセットでは `external_id` を使って Person / Source / Event / Union / Relation / Citation の照合候補を表示し、内部 `id` だけでは更新候補にしません。
- 取込方式ごとに、作成・更新・スキップ・別ID追加・全置換・保留/要確認の予定件数を表示します。
- 実行可能なのは引き続き `replace_all` のみで、`append_new` / `update_by_external_id` / `skip_existing` / `add_as_new_ids` はプレビューのみです。
- DB保存方式、JSON `schema_version`、Dexie schema versionは変更していません。

### v0.7.0 第5フェーズ: 参照先不明・仮人物作成方針

- CSVインポートプレビューで参照先不明の表示を強化し、ファイル名・行番号・列名・参照ID・参照元・参照先種別を確認できるようにしました。
- かんたんCSVの `father_id` / `mother_id` / `spouse_ids` と、標準CSVセットの union / relation / event / citation の各参照を整理して表示します。
- 参照先不明・仮人物作成方針として `warn_and_skip` / `block_import` / `create_placeholder_preview` を選べるようにしました。
- 現時点では仮人物の実保存は行わず、実行可能なのは `replace_all` + `warn_and_skip` のみです。
- DB保存方式、JSON schema_version、Dexie schema version は変更していません。

### v0.7.0 第6フェーズ: 標準CSVセット検証強化

- 標準CSVセットの取り込み前検証を強化し、必須ファイル・必須列・CSV内重複ID・参照整合・列挙値・manifest検証を追加または整理しました。
- 検証issueは severity / code / message に加えて fileName / rowNumber / field / targetType / targetId を確認しやすくし、error がある場合は標準CSVセットを取込不可にします。
- DB保存方式、JSON schema_version、Dexie schema version、標準CSVセット構造は変更していません。

### v0.7.0 第7フェーズ: ImportBatch最小版

- 既存のImportBatch / `importBatches`を活かし、かんたんCSVと標準CSVセットの取込成功時に最小取込履歴を記録するようにしました。
- 取込履歴には、取込日時、取込モード、取込方式、仮人物作成方針、取込件数、warning / error件数、参照先不明件数、仮人物候補件数、読み込んだファイル名を保持します。
- CSVインポート画面に直近の取込履歴一覧を追加し、0件時メッセージとPerson / Union / Relation / Source / Citation / Event件数を確認できるようにしました。
- preview_only方式（追加、external_id更新、既存スキップ、別ID追加、仮人物作成候補）は引き続き実行不可で、ImportBatchにも記録しません。
- JSON backup `schema_version`、Dexie schema version、標準CSVセット構造は変更していません。

### v0.7.0 第8フェーズ: インポート結果レポート

- かんたんCSVと標準CSVセットの取込後に、直近取込結果としてインポート結果レポートを表示するようにしました。
- レポートでは取込件数、warning/error、参照先不明、仮人物候補、external_id照合、取込方式ごとの予定処理、次に確認することを確認できます。
- ImportBatch一覧は直近履歴の概要として維持し、インポート結果レポートは直近取込結果の詳細表示として扱います。
- 詳細レポートのDB永続保存や行単位ログ保存はまだ行いません。
- JSON schema_version、Dexie schema version、標準CSVセット構造は変更していません。
