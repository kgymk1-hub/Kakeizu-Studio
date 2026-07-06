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
