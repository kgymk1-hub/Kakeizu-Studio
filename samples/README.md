# Kakeizu Studio v1.0 サンプルデータ

## サンプルの位置づけ

このディレクトリには、Kakeizu Studio v1.0の主要機能をまとめて確認するためのJSONバックアップ形式サンプルを置いています。

このデータはKakeizu Studioの機能確認用に作成した架空の家系です。実在の人物・戸籍・住所・資料とは関係ありません。

既存の内蔵サンプルCSVは、簡易CSVによる人物・婚姻・親子関係の確認用として維持します。このJSONは、Person / Union / ParentChildRelationに加えて、Event / Source / Citation / ImportBatch / Project / settings / Name / Placeまで含む「v1.0フル機能確認用サンプル」です。

## ファイル

- `samples/kakeizu_studio_v1_sample.json`
  - JSON backup schema 1.4
  - 3世代の架空家系「青葉家サンプル」
  - 固定ID・固定日時を使用

## 読み込み方法

読み込み前に、必要なら現在データをJSONバックアップしてください。JSONバックアップ復元は現在データを全置換します。

1. Kakeizu Studioを開く
2. 必要なら現在データをJSONバックアップする
3. 「JSONバックアップ復元」を選ぶ
4. `samples/kakeizu_studio_v1_sample.json`を選択する
5. 現在データが全置換されることを確認する

## 含まれるデータ

| 種別 | 件数 |
| --- | ---: |
| persons | 7 |
| unions | 3 |
| parent_child_relations | 6 |
| events | 7 |
| sources | 4 |
| citations | 27 |
| import_batches | 1 |
| projects | 1 |
| view_settings | 1 |
| export_settings | 1 |
| privacy_settings | 1 |
| names | 2 |
| places | 4 |

## 確認できる機能

- 3世代家系図
- 婚姻・親子関係
- biological / adoptive
- Person / Event / Source / Citation
- Name / Place
- 検索・一覧・ジャンプ
- ValidationPanel
- Project / settings
- 公開用出力モード
- PNG / PDF / SVG
- JSONバックアップ
- インポート履歴

## 意図的なValidation warning

このサンプルには、ValidationPanelの確認用としてwarningを2件だけ意図的に含めています。

- uncertainの親子関係：1件
- unreviewedの出来事：1件

参照切れや日付矛盾などのerrorは含みません。すべてのPerson / Union / ParentChildRelation / EventにはCitationを付けているため、意図しないmissing_citation warningも発生しない想定です。

## 公開用出力モードの確認

PrivacySettingには公開用出力の確認に使う設定を含めています。公開用出力モードは表示およびPNG / PDF / SVG向けのマスク確認用であり、元データ、通常CSV、JSONバックアップを書き換えるものではありません。

## 標準CSVセットとの違い

このサンプルはJSON backup schema 1.4です。Name / Placeを含みます。

現行の標準CSVセットにはnames.csv / places.csvがないため、このフル機能サンプルと同じ内容を標準CSVセットだけでは完全復元できません。

## 注意事項

- サンプル内の人物・場所・資料はすべて架空です。
- 実在の人物・戸籍・住所・資料とは関係ありません。
- 既存のサンプルCSV、App起動時のサンプル表示、サンプルCSVダウンロードは変更していません。
