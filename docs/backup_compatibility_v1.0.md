# Kakeizu Studio v1.0 JSONバックアップ互換性

## 対象
Kakeizu Studio v0.9.0固定状態＋v1.0本編統合A / BにおけるJSONバックアップschema 1.0〜1.4の代表fixture復元を対象とします。fixtureは過去の全出力パターンを完全再現するものではなく、各schemaの復元契約と不足データの補完動作を確認するための代表例です。

## 現在の互換性契約
- `parseJsonBackup`はschema 1.0 / 1.1 / 1.2 / 1.3 / 1.4を受け入れます。
- `createJsonBackup`の現行出力は常に`schema_version: "1.4"`です。
- 旧schemaで不足する配列は空配列に補完します。
- Project / settingsがない、または空配列の場合はdefault Project / settingsを補完します。

## schema別互換性マトリクス
| schema | 代表データ | 復元 | 補完内容 | 再出力 |
|---|---|---|---|---|
| 1.0 | Person中心 | 対応 | Source等、settings、Name / Place | 1.4 |
| 1.1 | Source / Citation | 対応 | Event、settings、Name / Place | 1.4 |
| 1.2 | Event | 対応 | settings、Name / Place | 1.4 |
| 1.3 | Project / settings | 対応 | Name / Place | 1.4 |
| 1.4 | Name / Place | 対応 | 原則補完不要 | 1.4 |

## 不足データの補完
- `sources`: `[]`
- `citations`: `[]`
- `events`: `[]`
- `names`: `[]`
- `places`: `[]`
- Project: `default-project` / `既定プロジェクト`
- ViewSetting: `default-view-setting`, `tree_display_mode: standard`, `show_relation_legend: true`
- ExportSetting: `default-export-setting`, `show_title: true`, `title: 家系図`, `show_legend: true`, `background: white`
- PrivacySetting: `default-privacy-setting`, `public_output_mode: false`, `hide_living_persons: false`, `hide_private_persons: true`, `hide_hidden_persons: true`, `hide_honseki: true`, `mask_living_dates: true`

Default settingsの`created_at` / `updated_at`は実行時刻になるため、固定値一致の確認対象外です。

## 現行形式への再出力
旧schemaを復元した後にJSONバックアップを作成すると、再出力JSONはschema 1.4になります。代表fixtureでは、Person ID、元fixtureに存在したSource / Citation / Event / Project / settings / Name / Placeの保持を自動テストで確認します。

## 自動テスト
`src/tests/backupCompatibility.test.ts`で次を確認します。

- 5 fixtureすべてのJSON.parseと`parseJsonBackup`成功。
- schema 1.0〜1.4別の保持・補完動作。
- schema 1.3の明示Project / settingsがdefaultに置き換わらないこと。
- schema 1.4のName / Place、`Event.place_id`、`Source.place_id`、Name / Place対象Citationの保持。
- 全schemaの復元→`createJsonBackup`→再復元で1.4形式になること。
- `schema_version` 0.9 / 1.5 / 欠落が`Unsupported schema_version`で拒否されること。
- JSON構文不正が例外になること。

## 手動確認
ファイル選択UI、復元完了メッセージ、人物一覧での固有人物名表示、復元後のJSONバックアップダウンロードは`docs/manual_checklist_v1.0.md`で手動確認します。JSON復元は現在データを全置換するため、確認前後に必要データをバックアップします。

## 非対応・確認対象外
- `parseJsonBackup`は対応schemaと不足配列の補完を扱いますが、全フィールドを厳格に検証するschema validatorではありません。
- 参照切れを自動修復しません。
- unsupported schemaは拒否します。
- 現行出力は常に1.4です。
- JSONバックアップには公開用マスクを適用しません。
- Mediaは含みません。
- IndexedDBへの実保存、ブラウザダウンロード、PNG / PDF / SVGの見た目、GitHub Pages、大規模データ性能、未来schemaの推測復元はこの自動テストの対象外です。

## 判定
schema 1.0〜1.4について、代表fixtureによる復元・補完・1.4再出力を確認しました。この判定は代表fixtureに基づく互換性確認であり、過去のあらゆるJSONの復元を保証するものではありません。
