# Kakeizu Studio v1.0 テスト範囲棚卸し

- 対象：v0.9.0固定状態＋v1.0本編統合A / B
- 目的：v1.0リリース前の自動テスト・手動確認・対象外範囲の整理

## テスト基準

- 開始時基準：30 test files / 312 tests
- 統合B追加後：31 test files / 332 tests

## 機能別マトリクス

| 分類 | 主な実装 | 自動テスト | 状態 | 手動確認 |
|---|---|---|---|---|
| JSONバックアップ | backupService | backupService / backupCompatibility / v1SampleData | 自動テスト済み | ファイル選択・ダウンロード |
| 標準CSVセット | standardCsvSetService | standardCsvSetService | 自動テスト済み | ZIP・複数ファイル |
| CSVインポート | csvMapping / importPreview | csvImport等 | 一部自動テスト | 実ファイル操作 |
| Validation | validationService | validationService / v1SampleData | 自動テスト済み | パネルからの移動 |
| Person / Relation | repositories / panels | repository・panel tests | 一部自動テスト | 実編集 |
| Event | repository / panel | event tests | 一部自動テスト | 実編集 |
| Source / Citation | repository / panel | source tests | 一部自動テスト | 実編集 |
| Name / Place | panel / backup | v1SampleData等 | 一部自動テスト | 追加・編集・削除 |
| Project / settings | projectSettings | backup / privacy tests | 一部自動テスト | checkbox保存 |
| 公開用表示 | privacyDisplayService | privacy tests | 自動テスト済み | 実画面・出力 |
| 家系図 | layout / FamilyTreeView | layout / view tests | 一部自動テスト | 見た目 |
| PNG / PDF / SVG | export services | export tests | 一部自動テスト | ダウンロード・見た目 |
| レスポンシブ | CSS | なし | 手動確認 | desktop / mobile |
| GitHub Pages | Actions / Vite | buildのみ | 手動確認 | 統合C |

## 既存テストファイル一覧

### JSONバックアップ・サンプル
- `src/tests/backupService.test.ts`: JSONバックアップ作成・復元、Source / Citation、Event、settings、Name / Placeの基本互換を確認。
- `src/tests/backupCompatibility.test.ts`: schema 1.0〜1.4代表fixtureの復元・補完・1.4再出力を確認。
- `src/tests/v1SampleData.test.ts`: v1フル機能サンプルJSONの件数、参照整合、Validation結果、再出力を確認。
- `src/tests/exportRoundTrip.test.ts`: エクスポート後の再取り込みに関する往復確認。

### CSV・ImportBatch
- `src/tests/csvImport.test.ts`: かんたんCSV読み込みの変換・取り込みを確認。
- `src/tests/csvMapping.test.ts`: CSV列マッピングや正規化を確認。
- `src/tests/importPreviewService.test.ts`: インポートプレビューと方針別挙動を確認。
- `src/tests/importReportService.test.ts`: インポート結果レポートを確認。
- `src/tests/importBatchService.test.ts`: ImportBatch履歴の作成・表示用データを確認。
- `src/tests/standardCsvSetService.test.ts`: 標準CSVセットのエクスポート・インポート対象を確認。

### Repository・Service
- `src/tests/familyRepository.test.ts`: Person / Union / ParentChildRelationの永続化層操作を確認。
- `src/tests/eventRepository.test.ts`: Event repository操作を確認。
- `src/tests/sourceRepository.test.ts`: Source / Citation repository操作を確認。
- `src/tests/kosekiEntryService.test.ts`: 戸籍入力系サービスの変換を確認。
- `src/tests/selectionService.test.ts`: 選択対象の扱いを確認。
- `src/tests/normalization.test.ts`: 入力値の正規化を確認。
- `src/tests/clipboard.test.ts`: clipboard関連の補助処理を確認。

### Validation・Privacy
- `src/tests/validationService.test.ts`: Validation issue生成、参照チェック、警告分類を確認。
- `src/tests/validationPanel.test.tsx`: ValidationPanel表示と操作を確認。
- `src/tests/privacyDisplayService.test.ts`: 公開用表示、マスク、非表示判定を確認。

### UI Panel・Filter
- `src/tests/personDetailPanel.test.tsx`: Person詳細パネルの表示・編集を確認。
- `src/tests/personListPanel.test.tsx`: 人物一覧パネルの表示・選択を確認。
- `src/tests/personListFilter.test.ts`: 人物一覧filterを確認。
- `src/tests/eventListPanel.test.tsx`: Event一覧パネルの表示・選択を確認。
- `src/tests/eventListFilter.test.ts`: Event一覧filterを確認。
- `src/tests/sourceCitationPanel.test.tsx`: Source / Citationパネルの表示・操作を確認。
- `src/tests/sourceCitationFilter.test.ts`: Source / Citation検索・filterを確認。
- `src/tests/commonDisplayComponents.test.tsx`: 共通表示コンポーネントを確認。

### 家系図・出力
- `src/tests/layoutService.test.ts`: 家系図レイアウト計算を確認。
- `src/tests/familyTreeView.test.tsx`: FamilyTreeViewの表示を確認。
- `src/tests/exportImageService.test.tsx`: PNG / PDF / SVG出力サービス周辺を確認。

### テストデータ
- `src/tests/sample_family.csv`: CSV関連テストの入力データ。

## リリース重要度

### P0：失敗したらv1.0リリース不可
- JSON 1.0〜1.4互換
- v1サンプル復元
- 標準CSVセット
- Validation
- TypeScript
- build
- production schema固定

### P1：重要だが手動確認で補完可能
- UIの実操作
- ファイルダウンロード
- レスポンシブ
- 公開用表示の見た目
- PNG / PDF / SVGの視覚確認

### Deferred：v1.1以降または別基盤
- E2E基盤
- 自動スクリーンショット比較
- クロスブラウザ自動試験
- 大規模データ性能試験
- アクセシビリティ専用自動監査

## 自動テスト済み
JSON backup service、代表fixture互換、v1サンプル、標準CSVセット、Validation、公開用表示、主要repository、主要filter、家系図レイアウト、出力サービスの一部は自動テストで守られています。

## 一部自動テスト
Person / Relation / Event / Source / Citation / Name / Place / Project settings / panel操作 / PNG・PDF・SVG出力は、ロジックや主要表示の一部を自動テストしていますが、ブラウザでの実操作と視覚確認が必要です。

## 手動確認が必要
ファイル選択、ダウンロード、IndexedDB永続化、レスポンシブ表示、公開用表示の見た目、家系図キャンバス操作、Import previewからの実操作、GitHub Pages公開確認は手動確認リストで補完します。

## v1.0では対象外
E2Eフレームワーク導入、スクリーンショット比較、クロスブラウザ自動試験、大規模データ性能試験、アクセシビリティ専用自動監査はv1.0直前には導入しません。

## 結論
- 自動テストだけでリリース判断を完結させません。
- 視覚・ファイル操作・永続化は手動確認リストで補完します。
- GitHub Pages確認は統合Cで実施します。
- 現在のテスト基盤をv1.0直前に大規模変更しません。
