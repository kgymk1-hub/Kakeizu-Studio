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


## 補完フェーズ：Place最小編集導線とName / Place境界整理

- Name / Place一覧パネルにPlace追加・編集・削除の最小導線を追加する。必須編集項目は `name` / `place_type` とし、`normalized_name`、住所、国、都道府県、市区町村、地区、公開レベル、確度、レビュー、メモは任意で扱う。
- Place一覧の検索・typeフィルタ・件数表示は維持し、追加・編集・削除後に一覧へ即時反映する。Place詳細専用画面は作らない。
- Place削除時は、そのPlaceを参照している `Event.place_id` / `Source.place_id` をクリアする。Event / Source本体は削除せず、`Event.place_text`、`Source.honseki_text`、`Source.repository` も同期上書きしない。
- `Event.place_id` / `Source.place_id` が存在するが対応Placeが存在しない場合は、Validationで `broken_reference` のwarningとして検出する。表示・JSON復元は参照切れでも落ちない安全表示を維持する。
- `Source.place_id` は型・Dexie・JSONで保持する任意参照であり、v0.9補完フェーズではSource詳細画面を新設しない。既存の `honseki_text` / `repository` が表示・編集用テキストとして残る。
- Name / PlaceはJSONバックアップでは `schema_version: "1.4"` として保存・復元する。
- 標準CSVセット構造はv0.9では変更しない。そのため `names.csv` / `places.csv` は出力せず、標準CSVセット経由ではName / Place実体を入出力しない。
- `citations.csv` で `target_type=name/place` を扱う場合も、標準CSVセット内にName / Place実体CSVがないため、標準CSVセット経由ではName / Place実体を復元しない。安全表示・検証準備までを現時点の範囲とし、この制限はv1.0以降または標準CSVセット拡張フェーズで再検討する。
- 今回やらないことは、v0.9.0リリース固定、package / README冒頭 / AppヘッダーVersion変更、RELEASE_NOTES正式追記、タグ手順追記、Name詳細専用画面、Place詳細専用画面、Source詳細画面新設、標準CSVセットへの `names.csv` / `places.csv` 追加、標準CSVセット構造変更、地図表示、緯度経度管理、地名階層の本格管理、既存テキストフィールドの廃止・完全同期、v1.0以降機能。

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

## 第9フェーズ：v0.9全体仕上げ確認

- v0.9第1〜第8フェーズと補完フェーズの接続を確認し、Name / Placeが既存フィールドの置き換えではなく横付け追加であることをREADMEと本ドキュメントに整理する。
- Person詳細のName追加・編集・削除、Name / Place一覧・検索、Place追加・編集・削除、Citation `target_type=name/place` の安全表示、Validationの参照検証、JSON backup `schema_version: "1.4"`、Dexie `version(5)`、標準CSVセット境界を仕上げ確認する。
- package / package-lock / Appヘッダー / README冒頭Versionは `0.8.0` のまま維持し、v0.9.0正式固定、RELEASE_NOTES正式追記、タグ手順追記は第10フェーズへ送る。

## v0.9全体まとめ

- v0.9で実装済み: `NameType` / `Name`、`PlaceType` / `Place`、Dexie `names` / `places`、Person詳細のName表示・追加・編集・削除、Name / Place一覧・検索、Place追加・編集・削除、Event / Sourceの任意 `place_id`、Citation `target_type=name/place` の安全表示・検証準備、JSONバックアップ1.4保存・復元。
- NameはPerson表示名の置き換えではない。`Person.display_name`、`family_name`、`given_name`、`birth_family_name` 等を維持し、Name編集でPerson本体を自動上書きしない。
- Placeは既存場所テキストの置き換えではない。`Event.place_text`、`Source.honseki_text`、`Source.repository` を維持し、Place編集でこれらを自動上書きしない。
- Place削除時は、そのPlaceを参照している `Event.place_id` / `Source.place_id` をクリアする。Event / Source本体、`Event.place_text`、`Source.honseki_text`、`Source.repository` は削除・同期上書きしない。
- `Event.place_id` / `Source.place_id` が参照切れの場合はValidation warningで検出し、画面表示とJSON復元は落ちない安全表示を維持する。
- `Source.place_id` は型・DB・JSONで保持する任意Place参照であり、Source編集UIでのPlace選択は将来対応。
- Citation `target_type=name/place` はSource / Citation一覧で対象名を解決し、参照切れでも落ちない。Validationでもname/place参照切れを検出する。Citation編集UIでのname/place本格選択は将来対応。
- JSONバックアップはName / Place実体を保存・復元するため `schema_version: "1.4"` に上げた。1.3以前のJSONでは `names` / `places` を空配列補完し、Project / ViewSetting / ExportSetting / PrivacySettingなど既存補完を維持する。
- Dexie schema `version(5)` は、既存 `version(1)`〜`version(4)` を維持したうえで `names` / `places` を追加し、Event / Sourceの任意Place参照保存に対応するために追加した。
- 標準CSVセットは従来の persons / unions / parent_child_relations / sources / citations / events / manifest 構造のまま維持する。`names.csv` / `places.csv` は追加せず、標準CSVセット経由ではName / Place実体を入出力しない。`citations.csv` の `target_type=name/place` は安全表示・検証対象だが、Name / Place実体復元は将来対応。
- v0.8のProject / settings / Privacy、v0.7のCSVインポート・標準CSVセット・ImportBatch / ImportReportの既存境界は維持する。

## 次フェーズ

次は **v0.9 第10フェーズ：v0.9.0リリース固定**。

## 第10フェーズ：v0.9.0リリース固定

v0.9.0リリース固定では、package / README / Appヘッダー / RELEASE_NOTES を0.9.0へ更新し、Name / Place 最小版フェーズを正式版として固定した。

このリリースでは、Dexie schema version(5) と JSON backup schema_version 1.4 を維持する。標準CSVセット構造、names.csv / places.csv、Name詳細専用画面、Place詳細専用画面、Source編集UIでのPlace選択、Citation編集UIでのname/place本格選択は追加しない。
