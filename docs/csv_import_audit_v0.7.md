# CSVインポート現状棚卸し v0.7 第1フェーズ

## 1. 対象ファイル

- `docs/specification.md`: Version 1.2 / v0.6.0実装反映版で、v0.7.0「CSVインポート本格化」と第1〜第10フェーズを定義している。
- `src/services/csvImportService.ts`: 単一CSV（かんたんCSV）のPapaParse実行、列名マッピング適用、Zod検証、正規化呼び出しを担当する。
- `src/schemas/csvSchemas.ts`: 単一CSV行の必須列・任意列・confidence/gender許容値を定義する。
- `src/services/normalizationService.ts`: 単一CSVの`person_id`を内部IDへ変換し、Person / Union / ParentChildRelation / ImportBatch / issueを生成する。
- `src/services/csvMappingService.ts`: CSVヘッダー取得、自動マッピング候補、マッピング検証、プレビュー用集計を担当する。
- `src/components/CsvImport/CsvImport.tsx`: 単一CSV入力、列マッピング、プレビュー、検証結果、取込実行UIを担当する。
- `src/services/csvExportService.ts`: 現在データから単一CSVを出力する。
- `src/services/standardCsvSetService.ts`: 標準CSVセットのCSV/manifest生成、無圧縮ZIP生成・読込、複数ファイル読込、検証・プレビューを担当する。
- `src/services/backupService.ts`: JSONバックアップ作成・復元を担当し、CSVで保持しにくい内部形式の完全復元先になっている。
- `src/App.tsx`: 単一CSV取込時の全置換、標準CSVセットZIP/複数ファイル取込、JSON復元、各出力導線を接続する。
- `src/db/dexieDb.ts`: 現行Dexie schema versionとテーブル構成の確認対象。今回変更しない。
- `src/tests/*csv*`, `src/tests/backupService.test.ts`, `src/tests/exportRoundTrip.test.ts`, `src/tests/normalization.test.ts`: CSV/標準CSV/JSONバックアップ関連の既存テスト。

## 2. 現在対応しているCSV形式

### かんたんCSV（単一CSV）

- 1ファイルCSV、textarea貼り付け、サンプルCSV読込に対応している。
- PapaParseの`header: true`、`skipEmptyLines: true`で読み込む。
- 列マッピングUIにより、CSVヘッダーをアプリ項目へ対応付ける。不要列は「取り込まない（無視）」にできる。
- 取込時は現在のPerson / Union / ParentChildRelation / Source / Citation / Event / ImportBatchをCSV内容で全置換する。
- Source / Citation / Eventは単一CSVからは構造化データとして取り込まない。

### 標準CSVセット

- Kakeizu Studioが生成した無圧縮ZIPの再インポートに対応している。
- `manifest.json`とCSV複数ファイルを直接選択するインポートに対応している。
- 対応ファイルは`persons.csv`, `unions.csv`, `parent_child_relations.csv`, `sources.csv`, `citations.csv`, `events.csv`, `manifest.json`。
- 標準CSVセット取込時も現在データを全置換する。

## 3. かんたんCSVの現状

- 必須列: `person_id`, `name`。
- 任意列: `family_name`, `given_name`, `kana`, `gender`, `birth_date`, `death_date`, `father_id`, `mother_id`, `spouse_ids`, `child_order`, `generation_no`, `title`, `note`, `source`, `confidence`。
- 日本語列名は`人物ID`, `個人ID`, `名前`, `氏名`, `性別`, `生年月日`, `父`, `母`, `配偶者`, `世代`, `称号`, `備考`, `出典`, `確度`などが自動候補に対応している。
- 英語列名は`person_id`, `personId`, `name`, `gender`, `sex`, `birth_date`, `death_date`, `father_id`, `mother_id`, `spouse_ids`, `source`, `confidence`などが対応している。
- 父母列は`father_id` / `mother_id`として読み、存在する親IDからParentChildRelationを作る。父母両方がある場合は親同士の`unknown` Unionを作る。片親のみの場合も片側だけの`unknown` Unionを作る。
- 配偶者列は`spouse_ids`をセミコロン区切りで読み、重複しないUnionを作る。
- `source`列はSource/Citationにはならず、Personの`note`へ`出典: ...`として追記される。
- `confidence`はPerson、生成されるUnion/Relationの確度に反映される。未指定時のUnionは`likely`または片親Unionで`uncertain`になる。
- `review_status`列は単一CSVスキーマ対象外。Personは`reviewed`、生成Union/Relationは`unreviewed`固定で作られる。
- Eventは単一CSVでは取り込まれない。
- 空欄は多くの任意列で`undefined`化される。`gender`は`male/female/unknown/other`、`confidence`は`confirmed/likely/uncertain/disputed`のみ許容される。

## 4. 標準CSVセットの現状

- ZIP取込: 対応。ただし現行のZIP読込は無圧縮ZIPのみ対応し、圧縮ZIPはエラーになる。
- 複数CSV直接取込: 対応。選択された`manifest.json`と標準CSV名のみを読む。
- `events.csv`以外の標準CSVファイル欠落は`missing_csv` error。`events.csv`は欠落しても空配列扱い。
- `manifest.json`欠落は`missing_manifest` error。JSONとして読めない場合は`invalid_manifest` error。`format`が`kakeizu_standard_csv_set`でなければ`invalid_format` error。
- 空CSVはPapaParse結果が空行扱いであれば空配列になる。ただし必須CSVそのものが欠落した場合はエラー。
- 取込時にImportBatchを1件生成するが、DBテーブル追加ではなく既存`importBatches`へ全置換保存する。生成IDは`csv-standard-${Date.now()}`、`source_name`は固定で`kakeizu_standard_csv_set.zip`。

## 5. 対応列一覧

### かんたんCSV

| アプリ項目 | 必須 | 主な対応列名 | 現状の取込先 |
|---|---:|---|---|
| `person_id` | 必須 | `person_id`, `personId`, `ID`, `人物ID`, `個人ID` | Person.external_id、内部ID変換元 |
| `name` | 必須 | `name`, `名前`, `氏名`, `表示名`, `人物名` | Person.display_name |
| `gender` | 任意 | `gender`, `sex`, `性別` | Person.gender |
| `birth_date` | 任意 | `birth_date`, `birth`, `生年月日`, `生年`, `誕生日`, `出生日` | Person.birth_date_text |
| `death_date` | 任意 | `death_date`, `death`, `没年月日`, `没年`, `死亡日` | Person.death_date_text |
| `father_id` | 任意 | `father_id`, `father`, `父ID`, `父`, `父親`, `父人物ID` | ParentChildRelation parent参照 |
| `mother_id` | 任意 | `mother_id`, `mother`, `母ID`, `母`, `母親`, `母人物ID` | ParentChildRelation parent参照 |
| `spouse_ids` | 任意 | `spouse_ids`, `spouse`, `spouses`, `配偶者ID`, `配偶者`, `夫婦` | Union生成 |
| `generation_no` | 任意 | `generation_no`, `generation`, `世代`, `代数` | Person.generation_no |
| `title` | 任意 | `title`, `称号`, `肩書`, `官位`, `爵位` | Person.rank_title |
| `note` | 任意 | `note`, `notes`, `備考`, `メモ` | Person.note |
| `source` | 任意 | `source`, `出典`, `根拠` | Person.noteへ文字列追記 |
| `confidence` | 任意 | `confidence`, `確度`, `信頼度` | Person/Union/Relation confidence |

`family_name`, `given_name`, `kana`, `child_order`はスキーマに任意列として存在するが、標準マッピング定義には現時点で明示的な日本語/英語別名が少ない。

### 標準CSVセット

- `persons.csv`: `id`, `external_id`, `name`, `gender`, `birth_date`, `death_date`, `generation_no`, `title`, `note`, `confidence`, `created_at`, `updated_at`。必須は`id`, `name`。
- `unions.csv`: `id`, `external_id`, `partner1_id`, `partner2_id`, `union_type`, `marriage_date_text`, `divorce_date_text`, `end_date_text`, `end_reason`, `status`, `confidence`, `review_status`, `note`, `created_at`, `updated_at`。必須は`id`, `partner1_id`。
- `parent_child_relations.csv`: `id`, `parent_id`, `child_id`, `relation_type`, `start_date_text`, `end_date_text`, `confidence`, `review_status`, `note`, `created_at`, `updated_at`。必須は`id`, `parent_id`, `child_id`。
- `sources.csv`: `id`, `external_id`, `source_type`, `title`, `author_or_issuer`, `issued_date_text`, `obtained_date`, `repository`, `honseki_text`, `head_of_registry`, `registry_type`, `source_text`, `url`, `privacy_level`, `note`, `import_batch_id`, `created_at`, `updated_at`。必須は`id`, `title`。
- `citations.csv`: `id`, `external_id`, `source_id`, `target_type`, `target_id`, `page_or_location`, `quote_text`, `interpretation`, `confidence`, `note`, `import_batch_id`, `created_at`, `updated_at`。必須は`id`, `source_id`, `target_type`, `target_id`。
- `events.csv`: `id`, `external_id`, `event_type`, `target_type`, `target_id`, `date_text`, `date_from`, `date_to`, `place_text`, `description`, `confidence`, `review_status`, `note`, `import_batch_id`, `created_at`, `updated_at`。必須は`id`, `event_type`, `target_type`, `target_id`。

## 6. external_id / 内部ID変換の現状

- かんたんCSVではCSV上の`person_id`を内部IDとしては使わず、`per_${nanoid}`形式の新規内部IDを毎回生成する。
- かんたんCSVの`external_id`はPerson.external_idに保存される。Union/Relationにも`U001`, `R001`のような取込内連番external_idが生成される。
- かんたんCSVでは既存DBのexternal_id照合、更新、スキップ、別ID追加選択はない。取込実行時に全置換される。
- かんたんCSV内の重複`person_id`は`duplicate_person_id` errorになるが、重複行からも内部ID Map生成は試みられるため、次フェーズで安全性の見直し候補。
- 標準CSVセットではCSV上の`id`を内部IDとしてそのまま使う。`external_id`は任意属性として保持するのみで参照解決には使わない。
- 標準CSVセットでも既存DBとのexternal_id照合、更新、スキップ、別ID追加選択はない。反映時は全置換される。
- Source/Citation/Event/Union/Relationのexternal_idも、標準CSVセットでは保持はするが参照解決キーには使わない。

## 7. 参照解決の現状

- かんたんCSVの`father_id` / `mother_id` / `spouse_ids`はCSV内`person_id`から内部Person.idへ変換される。
- かんたんCSVの参照先不明親は`unknown_parent_id` warning、参照先不明配偶者は`unknown_spouse_id` warningで、取り込み自体は確認後に可能。
- かんたんCSVの自己配偶者は`self_spouse` error、自己親は`self_parent` error、親子循環は`parent_cycle` error。
- 標準CSVセットのUnion partner、ParentChildRelation parent/child、Event target、Citation source/targetはCSV上の`id`セットに存在するか検証される。
- 標準CSVセットの参照先不明はerrorで、反映ボタンが無効になる。
- Citation target_type `name` / `place`は将来用としてwarningを出し、参照先データ未実装のまま読み込む。
- Event target_typeは`person` / `union` / `relation`の存在確認がある。その他target_typeの厳密な列挙検証は現状弱い。

## 8. エラー・警告・プレビューの現状

- かんたんCSVにはステップ式UIがあり、入力、列マッピング、プレビュー、検証、取込の順に進む。
- かんたんCSVプレビューは行番号、主要列、判定結果を表示し、error行/warning行/正常行をCSSクラスで区別する。
- かんたんCSV検証結果は件数、warning/error件数、未登録人物ID参照件数、自動補完配偶者関係件数、issue一覧を表示する。
- errorがあるかんたんCSVは取込不可。warningのみの場合は`window.confirm`で確認してから取込できる。
- 標準CSVセットにはインポート前プレビューとして各ファイルの件数、warning/error件数、issue一覧、反映ボタンがある。
- 標準CSVセットはerrorがあると反映ボタンが無効になる。
- 取込後はステータスメッセージが表示されるが、行単位の詳細レポート保存やImportBatch詳細画面はない。
- 取込方式選択（全置換/追加/更新/スキップ/別ID追加）は未実装。現状は全置換のみ。

## 9. 現在のテスト範囲

- `csvImport.test.ts`: かんたんCSV正常読込、日本語列名マッピング、必須列欠落検出。
- `csvMapping.test.ts`: ヘッダー取得、自動マッピング、手動マッピング、必須マッピング検証、プレビュー集計など。
- `normalization.test.ts`: external_idと内部ID分離、spouse_idsからのUnion重複抑止、父母からの親子関係、自己配偶者エラー。
- `exportRoundTrip.test.ts`: 単一CSV出力と再取込、親列割当、note出力など。
- `standardCsvSetService.test.ts`: 標準CSVセットのファイル生成、ZIP/複数ファイル読込、manifest、欠落ファイル、Event/Source/Citation/Relation/Union参照検証、旧列名互換、属性ラウンドトリップ。
- `backupService.test.ts`: JSONバックアップのSource/Citation/Event保持、旧JSON互換、Relation/Union属性保持。
- 参照先不明ケースは標準CSVセット側で比較的広くあるが、かんたんCSVのunknown parent/spouseや重複IDの詳細テストは薄い。
- UIコンポーネントとしてのCSV取込操作テストは限定的。

## 10. v0.7で改善すべき点

1. 既存external_id照合を追加し、新規/更新/スキップ/別ID追加候補を明示する。
2. 全置換以外の取込方式を選択できるようにする。
3. かんたんCSVでSource/Citation/Eventをどう扱うかを仕様化する。少なくとも`source`列のnote追記だけでよいか再検討する。
4. かんたんCSVの重複`person_id`時に内部ID Map生成まで進む現状を安全側に整理する。
5. 参照先不明をwarningとして無視するか、仮人物作成するか、取込ブロックするかを選べるようにする。
6. 標準CSVセットの圧縮ZIP対応可否を決め、現行の無圧縮ZIP制約をUI/ドキュメントでより明確にする。
7. 標準CSVセットの列挙値検証（gender, confidence, review_status, event_type, target_typeなど）を強化する。
8. manifestの`files`内容、schema_version、余剰/不足ファイルの扱いを強化する。
9. 取込前プレビューを正常/警告/エラー行の表形式へ拡張する。
10. 取込後の結果レポート、ImportBatch詳細、行単位ログを追加する。
11. かんたんCSVの日本語列名候補に`姓`, `名`, `かな`, `フリガナ`, `続柄順`などを追加するか検討する。
12. 標準CSVセットでexternal_id参照を許容するか、内部`id`参照のみを維持するかを明文化する。

## 11. 次フェーズへの申し送り

- 第2フェーズはUI実装に入る前に、かんたんCSV/標準CSVセット共通の「プレビュー用中間モデル」を設計すると安全。
- 現在の単一CSVと標準CSVセットはどちらも最終的に全置換保存であり、追加・更新系の実装ではDB保存層とプレビュー層の分離が必要。
- package version、JSON backup `schema_version`、Dexie schema version、DBテーブル、標準CSVセット構造は本棚卸しでは変更していない。
- 仕様書`docs/specification.md`はVersion 1.2 / v0.6.0実装反映版を確認し、今回は変更していない。

## v0.7 第2フェーズ: インポート結果プレビュー強化

- `src/services/importPreviewService.ts` に、かんたんCSVと標準CSVセットで共有できる `ImportPreviewIssue` / `ImportPreviewSummary` / `ImportPreviewResult` と集計関数を追加した。プレビューは `importPolicy: replace_all`、正常行・警告行・エラー行、severity別issue件数、取り込み予定件数を持つ。
- かんたんCSVプレビューでは、総行数、正常行、警告行、エラー行、Person / Union / ParentChildRelation / Event / Source / Citation の取り込み予定件数、全置換取込であること、error時の取込不可、warningのみ時の注意表示を確認できるようにした。
- 標準CSVセットプレビューでは、読み込まれたCSVファイル別件数、`manifest.json` の有無、取り込み予定件数、warning / error件数、全置換取込であること、error時の反映不可を確認できるようにした。
- issue一覧は、severity、code、messageに加えて、取得できる範囲で行番号、ファイル名、対象列、対象種別、対象IDを表示するよう整理した。
- 未対応のissue検出は残る。未知の列挙値の網羅的検出、標準CSVセット内の重複id詳細表示、issueごとのファイル名推定精度向上、かんたんCSVの循環・重複以外の高度な検出は次フェーズ以降の候補。
- 次フェーズでは、この共通プレビュー結果を使って、取込方式選択、既存 `external_id` 照合、更新/スキップ/別ID追加の判断表示につなげる。
