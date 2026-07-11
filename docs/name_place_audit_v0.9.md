# v0.9 Name / Place 現状棚卸し・実装記録

## 第1フェーズ：Name / Place現状棚卸し

- 名前情報は現在 `Person.display_name` を主表示名として保持し、`family_name` / `given_name` / `family_name_kana` / `given_name_kana` / `birth_family_name` / `rank_title` もPerson上に保持している。
- 場所情報は `Event.place_text`、`Source.honseki_text`、`Source.repository`、およびPersonの本籍・出生地/死亡地系フィールドに分散している。
- Citationは型上 `target_type: person / event / union / relation / name / place` を持つが、v0.8時点ではName / Place実体の解決処理が未整備だった。
- JSON backup schema_versionはv0.8時点で `1.3`、Dexie schemaは `version(4)`、標準CSVセットは persons / unions / parent_child_relations / sources / citations / events のまま。

## 第2フェーズ：Nameモデル最小版

- `NameType` と `Name` を追加し、`person_id`、`name_type`、`name_text`、仮名・期間・確度・レビュー・メモを保持する。
- Dexie `version(5)` で `names` テーブルを追加する。
- `Person.display_name` は主要表示名として維持し、Nameで自動上書きしない。

## 第3フェーズ：PersonとNameの最小連携

- Person詳細パネルで、その人物に紐づくName一覧を表示する。
- Nameの追加・編集・削除の最小導線を追加する。
- Name削除時にPerson本体は削除しない。

## 第4フェーズ：Placeモデル最小版

- `PlaceType` と `Place` を追加し、地名、正規化候補、住所テキスト、都道府県・市区町村、公開レベル、確度、レビュー、メモを保持する。
- Dexie `version(5)` で `places` テーブルを追加する。
- 緯度経度、地図表示、地名階層の本格管理は今回実装しない。

## 第5フェーズ：Event / Source とPlaceの最小連携

- `Event.place_text` を維持したまま `Event.place_id` を任意追加する。
- `Source.honseki_text` / `Source.repository` を維持したまま `Source.place_id` を任意追加する。
- 参照切れPlaceがあっても表示・復元が落ちない方針とする。

## 第6フェーズ：Name / Place一覧・検索最小版

- Name / Place一覧を左側パネルに追加する。
- Nameは `name_text`、`name_type`、関連Person名、確度、レビューで確認し、検索・typeフィルタ・件数・0件表示を持つ。
- Placeは `name`、`place_type`、`normalized_name`、都道府県、市区町村、公開レベルで確認し、検索・typeフィルタ・件数・0件表示を持つ。

## 第7フェーズ：Citation target_type name / place の準備

- Citation対象解決で `target_type=name` はName名と関連Person、`target_type=place` はPlace名を安全表示する。
- 参照切れName / Placeは参照切れとして表示・検証できるようにする。
- Citation編集UIでの本格的なname/place選択は今回の対象外。

## 第8フェーズ：JSONバックアップ・DB互換性確認

- 新規JSON backup schema_versionを `1.4` に上げ、`names` / `places` を含める。
- 1.3以前のJSONは `names` / `places` がなくても空配列として補完する。
- Project / ViewSetting / ExportSetting / PrivacySettingの補完は維持する。

## Dexie schema version(5)追加理由

Name / Placeを横付けテーブルとして保存するため、既存 `version(1)`〜`version(4)` を維持したうえで `version(5)` に `names` / `places` をまとめて追加する。

## JSON backup schema_version 1.4追加理由

JSONバックアップの対象にName / Placeを追加するため、v0.8の `1.3` から `1.4` へ上げる。古いJSONは互換復元し、欠落配列を空配列で補完する。

## 標準CSVセット構造を変更しない理由

v0.9ではName / Placeの最小モデルとUI、JSON/DB互換を優先する。`names.csv` / `places.csv` は将来候補に留め、標準CSVセットには追加しない。

## 既存データ互換性

- 既存Person / Event / Sourceフィールドは削除しない。
- `Person.display_name`、`Event.place_text`、`Source.honseki_text`、`Source.repository` は表示・編集用として維持する。
- Name / Placeは既存フィールドを置き換えず、横に追加する。

## 今回やらないこと

v0.9.0リリース固定、package / README冒頭 / AppヘッダーVersion変更、RELEASE_NOTES正式追記、タグ手順追記、Name/Place完全詳細画面、標準CSVセットへの names.csv / places.csv 追加、地図表示、緯度経度管理、GEDCOM、親等計算、v1.0以降機能は行わない。

## 次フェーズ

次は **v0.9 第9フェーズ：v0.9全体仕上げ確認**。
