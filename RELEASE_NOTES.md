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
