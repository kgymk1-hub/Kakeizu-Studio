# Kakeizu Studio v1.0.0 リリース検証記録

## 判定（2026-10-06）

- P0 / P1: PASS WITH WARNINGS（現行仕様・既知制限の範囲）
- 手動検証: 50 / 50 PASS、FAIL 0、未確認 0
- package / package-lock / App / README: 1.0.0
- JSON出力schema: 1.4、復元対象: 1.0〜1.4
- Dexie: version(1)〜version(5)、標準CSVセット構造は維持
- 正式版のタグ・GitHub Release・Pages: 公開処理後に追記

## 検証対象

- 修正統合済みmain: `baa5e241a5057c01304ce2d11f86db386298b3f3`（PR #90 / #91）
- 統合Dの変更: バージョン表示・文書・実施済み検証記録のみ
- 実施記録: [手動チェックリスト](manual_checklist_executed_2026-10-06.md)
- 詳細履歴: [残検証の結果](v1_remaining_verification_2026-10-06.md)

## 自動検証

- Vitest 33ファイル / 343テストPASS
- TypeScript / production build: PASS
- schema 1.0〜1.4代表fixtureとv1サンプル: 自動テストでPASS
- 統合Dのバージョン更新後にも全テスト・TypeScript・buildを再実施

## 実ブラウザ検証

Edge / Windows、desktop 1280×900、mobile 390×844で実施。

- Person / 関係 / person対象Event / 資料 / Citation / Name / Placeの操作
- JSON復元、旧schema復元・再出力、標準CSV ZIP・複数ファイル・単一CSVの全置換
- Name 2 / Place 4の反映直後・再読込後の保持
- 関係対象Eventから関連人物への詳細移動
- 公開用設定のprivate / hidden / 生存日付マスク
- PNG / PDFの描画、SVG構造・単独表示、検索・フィルタとmobileレイアウト
- 最終JSONの9データ配列は青葉家の元fixtureと一致
- 最終状態: Person 7 / Name 2 / Place 4、error 0 / warning 2、コンソールerrorなし

MAN-008はユーザーがEdge再起動後のPerson 7 / Name 2 / Place 4を直接確認。
MAN-045のSVG単独表示もユーザーが直接確認。通常版は山田家、公開版は青葉家という出力時点の違いを説明し、各ファイルの欠けなし・公開用マスクを個別に確認した。

## 制限と警告

- Vite chunk-size warningは継続。ビルド失敗ではない。
- 標準CSVにはName / Placeの実体を含めない。既存Name / Placeの保持を確認。
- Source / Place専用詳細へのカード移動は未対応。MAN-027はPerson / Name / Eventと既存編集導線の範囲。
- Union / Relation対象Eventは一覧・関連人物移動のみ。CRUD UIはperson対象。
- Project名編集は未対応。復元名の表示と設定永続化を確認。
- 詳細: [既知制限](known_limitations_v1.0.md)

## 公開URL

https://kgymk1-hub.github.io/Kakeizu-Studio/?v=1.0.0

公開後は対象commitのActions成功と実際のVersion 1.0.0表示を確認する。
