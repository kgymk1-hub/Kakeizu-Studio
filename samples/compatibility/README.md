# JSONバックアップ互換性確認fixture

## 目的
Kakeizu Studio v1.0リリース前に、JSONバックアップschema 1.0〜1.4の復元・不足データ補完・現行形式への再出力を確認するための固定fixtureです。

## fixtureの位置づけ
これらのfixtureは、過去の全出力パターンを完全再現するものではありません。各schemaで現在の復元処理が受け入れる代表的な最小構成を固定した、後方互換性確認用fixtureです。各schemaの復元契約と、不足データの補完動作を確認するための代表例です。

## ファイル一覧
| ファイル | schema | 固有人物名 | 主なデータ |
|---|---:|---|---|
| `backup_schema_1_0.json` | 1.0 | 互換確認 一〇 | Person |
| `backup_schema_1_1.json` | 1.1 | 互換確認 一一 | Person / Source / Citation |
| `backup_schema_1_2.json` | 1.2 | 互換確認 一二 | Person / Source / Event / Citation |
| `backup_schema_1_3.json` | 1.3 | 互換確認 一三 | Project / settingsまで |
| `backup_schema_1_4.json` | 1.4 | 互換確認 一四 | Name / Placeまで |

## 各schemaの確認内容
- 1.0: `sources` / `citations` / `events` / `names` / `places` とProject / settingsの補完。
- 1.1: Source / Citationの保持とEvent以降の補完。
- 1.2: EventとEvent Citationの保持、Project / settingsおよびName / Placeの補完。
- 1.3: 明示Project / settingsの保持、Name / Placeの補完。
- 1.4: Name / Place、`Event.place_id`、`Source.place_id`、Name / Place対象Citationの保持。

## 手動での復元方法
1. 現在データを「JSONバックアップ」で保存する
2. 「JSONバックアップ復元」を押す
3. 対象fixtureを選択する
4. 復元完了メッセージを確認する
5. 人物一覧等でfixture固有の人物名を確認する
6. 次のfixtureを試す前に必要なデータを再バックアップする

## 復元時の注意
JSONバックアップ復元は現在データを全置換します。既存データが必要な場合は、fixture復元前と次のfixtureを試す前に必ず「JSONバックアップ」で保存してください。

## 現行出力形式
旧schemaを復元した後に「JSONバックアップ」を実行すると、新しく出力されるJSONは`schema_version` 1.4になります。

## 対象外
IndexedDBへの実保存、ファイル選択UI、ブラウザダウンロード、PNG / PDF / SVGの見た目、大規模データ性能、厳密schema validation、破損参照の自動修復、未来schemaの推測復元はこのfixture単体の対象外です。
