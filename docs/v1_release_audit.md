# Kakeizu Studio v1.0 リリース到達点棚卸し

- 対象バージョン：v0.9.0固定状態
- 目的：v1.0.0安定版へ収録する実装範囲の確定
- 方針：新機能追加ではなく、v0.1.0〜v0.9.0到達点の整理
- 作成日：2026-07-11

## 棚卸し根拠

本棚卸しは、`docs/specification.md`、各監査文書、README / RELEASE_NOTESに加え、`src/models/index.ts`、`src/db/dexieDb.ts`、`src/services/*`、`src/components/`、`src/tests/`を照合した結果です。仕様書の転記ではなく、モデル型、Dexie version(1)〜version(5)、JSON backup schema 1.4、検証・インポート・設定・Name / Place関連テストの存在を根拠に分類します。

## バージョン別到達点

| バージョン | テーマ | 状態 | 主な実装 | v1.0での扱い |
| --- | --- | --- | --- | --- |
| v0.1.0 | CSVから家系図を作るMVP | 実装済み | Person / Union / ParentChildRelation、簡易CSV、JSON、標準CSVセット、SVG家系図、PNG / PDF | v1.0の中核データ・入出力として収録 |
| v0.2.0 | 戸籍入力モード | 実装済み | Event / Source / Citation / Event Citation | 戸籍・根拠管理の基本機能として収録 |
| v0.3.0 | 関係単位Citation | 実装済み | relation / union target Citation、関係編集、関係削除、削除時Citation処理 | 関係根拠管理として収録 |
| v0.4.0 | Validation | 実装済み | 出典なし、未確認、低確度、参照切れ、自己参照、日付・年齢確認 | ValidationPanelと純粋関数検証として収録 |
| v0.5.0 | 家系図表示密度・出力 | 実装済み | compact/standard/detailed相当、生没年、confidence / review_status、関係線表現、凡例、PNG / PDF / SVG出力 | 表示・出力の安定版範囲として収録 |
| v0.6.0 | 共通選択・ジャンプ | 実装済み | Person一覧、Event一覧、Source / Citation一覧、ValidationPanelからの移動 | 一覧・検索・ジャンプとして収録 |
| v0.7.0 | インポートプレビュー | 一部実装 | ImportPolicy、PlaceholderPersonPolicy、external_id照合、参照先不明検出、ImportBatch、ImportReport | 実保存はreplace_all中心、差分方式はpreview_onlyとして収録 |
| v0.8.0 | Project / settings | 最小版実装済み | Project、ViewSetting、ExportSetting、PrivacySetting、公開用出力モード | 設定管理の器として収録。データ分離は対象外 |
| v0.9.0 | Name / Place | 最小版実装済み | Name / Place一覧、Event / SourceとPlaceの連携、Citation target_type name / place、JSON schema 1.4、Dexie version(5) | 追加情報・正規化候補として収録。標準CSVセット連携は対象外 |

## 実装状態の分類

| 項目 | 状態 | 現在できること | 現在できないこと |
| --- | --- | --- | --- |
| Project | 最小版実装済み | 設定管理の器 | 複数Project切替・データ分離 |
| Name | 最小版実装済み | 別名・旧名・通称等の追加管理、JSON保存 | Person表示名の完全置換、標準CSVセット対応 |
| Place | 最小版実装済み | Event / Sourceから任意参照、JSON保存 | 既存場所文字列の完全置換、地図・緯度経度 |
| ImportPolicy | 一部実装 | プレビューと影響確認 | replace_all以外の実保存 |
| Media | 未実装 | なし | 添付ファイル管理、画像マスク、JSON保存 |
| GEDCOM / OCR / AI支援 | v1.1以降 | なし | 外部連携・自動読取 |

## モデル別棚卸し

| モデル | 実装状態 | 主な用途 | UIの有無 | JSONバックアップ対応 | 標準CSVセット対応 | v1.0での位置づけ | v1.1以降へ送る内容 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Person | 実装済み | 人物基本情報、表示名、生没年、世代、privacy | あり | 対応 | 対応 | 中核モデル | 一括編集、高度な生存者推定 |
| Union | 実装済み | 婚姻・配偶者関係 | あり | 対応 | 対応 | 中核関係モデル | 複雑な関係履歴UI |
| ParentChildRelation | 実装済み | 親子関係、biological / adoptive等 | あり | 対応 | 対応 | 中核関係モデル | 親等計算、相続判定 |
| Event | 実装済み | 出生・婚姻・養子縁組・居住等 | あり | 対応 | 対応 | 戸籍・出来事管理 | Person / Union / Relationとの自動同期 |
| Source | 実装済み | 戸籍・聞き取り・書籍等の資料 | あり | 対応 | 対応 | 根拠管理 | 添付ファイル、詳細画面 |
| Citation | 実装済み | Sourceと各対象の根拠付け | あり | 対応 | 対応 | 根拠管理 | name / place選択UI強化 |
| ImportBatch | 最小版実装済み | 取込履歴、件数、warning/error記録 | あり | 対応 | 間接対応 | 履歴確認 | 詳細レポート永続化強化 |
| Project | 最小版実装済み | 設定管理の器 | あり | 対応 | 非対応 | 単一default相当 | 複数Project、削除・複製、データ分離 |
| ViewSetting | 最小版実装済み | 表示密度・凡例設定 | あり | 対応 | 非対応 | 表示設定 | 複数ビュー |
| ExportSetting | 最小版実装済み | タイトル・凡例・背景 | あり | 対応 | 非対応 | 出力設定 | 出力テンプレート |
| PrivacySetting | 最小版実装済み | 公開用出力マスク | あり | 対応 | 非対応 | 表示・画像出力向けマスク | 公開用CSV / JSON、専用PDF |
| Name | 最小版実装済み | 旧姓・別名・出生名等 | あり | 対応 | 非対応 | Personに横付けする追加情報 | 表示名同期、詳細画面、CSV対応 |
| Place | 最小版実装済み | 本籍・出生地・居住地・保管場所等 | あり | 対応 | 非対応 | 場所の正規化・再利用候補 | 自動同期、地図、CSV対応 |
| Media | 未実装 | 添付ファイル予定 | なし | 非対応 | 非対応 | v1.0対象外 | 画像・PDF添付、マスク、OCR |

## 機能別棚卸し

| 機能 | 状態 | v1.0での扱い |
| --- | --- | --- |
| データ入力 | 実装済み | 既存UIでPerson / Relation / Event / Source等を扱う |
| CSVインポート | 一部実装 | replace_all実保存と各種preview_onlyを収録 |
| 標準CSVセット | 実装済み | 現行構造を維持。Name / Place / Mediaは追加しない |
| JSONバックアップ | 実装済み | schema_version 1.4でName / Place / settingsまで保存復元 |
| 検索・一覧 | 実装済み | Person / Event / Source / Citation / Name / Place等を確認 |
| 選択・ジャンプ | 実装済み | 共通選択モデルで関連対象へ移動 |
| 検証 | 実装済み | ValidationPanel、validateFamilyDataを収録 |
| 家系図表示 | 実装済み | 簡易独自レイアウトを収録 |
| 画像・文書出力 | 実装済み | PNG / PDF / SVGを収録 |
| 公開用出力 | 最小版実装済み | 表示・PNG / PDF / SVG向けマスクとして収録 |
| 設定保存 | 最小版実装済み | Project / ViewSetting / ExportSetting / PrivacySettingを収録 |
| サンプルデータ | 実装済み | 既存CSVに加え、v1.0フル機能JSONサンプルを追加 |
| テスト | 実装済み | 既存テストにサンプル検証テストを追加 |
| GitHub Pages | 実装済み | 既存公開設定を維持 |

## v1.0.0へ収録する機能

- Person / Union / ParentChildRelation
- Event / Source / Citation
- 関係単位Citation
- ValidationPanel / validateFamilyData
- 家系図表示・PNG / PDF / SVG出力
- CSV / 標準CSVセット / JSONバックアップ
- 一覧・検索・ジャンプ
- ImportBatch / ImportReport最小版
- Project / settings最小版
- 公開用出力モード最小版
- Name / Place最小版
- v1.0フル機能確認用JSONサンプル

## v1.0.0へ収録しない機能

| 機能 | 扱い |
| --- | --- |
| 表形式入力 | v1.1以降 |
| 一括編集 | v1.1以降 |
| 本格的な複数Project | v1.1以降 |
| 複数ビュー | v1.1以降 |
| Media / 添付ファイル | v1.1以降 |
| 和暦本格解析 | v1.1以降 |
| 標準CSVセットへのName / Place追加 | v1.1以降 |
| GEDCOM | v1.1以降 |
| 親等計算 | v1.1以降 |
| 相続関係説明図 | v1.1以降 |
| OCR / AI支援 | v1.1以降 |

## 重要な設計境界

### Name

Person.display_name等を置き換えません。別名・旧名・通称等の追加情報として扱います。

### Place

Event.place_text、Source.honseki_text、Source.repositoryを置き換えません。場所の正規化・再利用候補として扱います。

### Project

Projectは設定管理の器です。Person等のデータ分離単位ではありません。

### 公開用出力

公開用出力は表示・PNG・PDF・SVG向けのマスクです。元データ、通常CSV、JSONバックアップを変更しません。

### JSON / 標準CSVセット

JSONはName / Placeを保存・復元します。標準CSVセットはName / Place実体をまだ扱いません。現行の標準CSVセット構造を維持し、names.csv / places.csv / media.csvは追加しません。

## Findings

### Blockers

なし。

### Warnings

なし。

### Notes

README、RELEASE_NOTES、正式仕様書のv1.0向け整理は後続の統合Cで実施します。Media、GEDCOM、OCR / AI支援、親等計算、相続関係説明図はv1.1以降候補として扱います。
