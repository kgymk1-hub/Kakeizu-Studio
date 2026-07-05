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

v0.1.0のタグ作成とpushは、リリース担当者が内容確認後に実行してください。

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
