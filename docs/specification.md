# 戸籍・出典管理対応 家系図作成アプリ 詳細仕様書

Version 1.5.1

v0.9.0 実装反映・v1.0以降方針追記版

---

## 改訂履歴

| 版 | 内容 |
|---|---|
| Version 1.0 | 初期詳細仕様。戸籍・出典管理対応の家系図作成アプリとして、基本方針、データモデル、CSV、入力UI、家系図表示、出力、検証、実装構成を定義。 |
| Version 1.1 | Kakeizu Studio v0.5.0 までの実装状況を反映。戸籍入力、Event、Source/Citation、関係根拠、検証機能、家系図表示強化、関係線表示強化、出力用見た目設定、PNG/PDF/SVG出力を反映。 |
| Version 1.2 | Kakeizu Studio v0.6.0 までの実装状況を反映。検索・一覧・検証結果からの修正導線として、選択・ジャンプ基盤、Person一覧、Event一覧、Source/Citation一覧、ValidationPanelからの対象移動、一覧・検索UI仕上げを反映。 |
| Version 1.3 | Kakeizu Studio v0.7.0 までの実装状況を反映。CSVインポート本格化として、インポート結果プレビュー、取込方式選択、external_id照合、参照先不明・仮人物作成方針、標準CSVセット検証強化、ImportBatch最小版、インポート結果レポートを反映。 |
| Version 1.4 | Kakeizu Studio v0.8.0 までの実装状況を反映。Projectモデル最小版、ViewSetting、ExportSetting、PrivacySetting、設定のDB永続化、公開用出力モード最小版、JSON backup schema_version 1.3、Dexie schema version(4)、v0.8.0リリース固定を反映。今後のロードマップを v0.9.0 以降に整理。 |
| Version 1.5 | Kakeizu Studio v0.9.0 までの実装状況を反映。Nameモデル最小版、Placeモデル最小版、PersonとNameの最小連携、Event / SourceとPlaceの最小連携、Name / Place一覧・検索、Citation target_type=name/placeの安全表示・検証、Place編集導線、JSON backup schema_version 1.4、Dexie schema version(5)、v0.9.0リリース固定を反映。今後のロードマップを v1.0.0 以降に整理。 |
| Version 1.5.1 | 最初期仕様書との照合結果を反映。v1.0.0では新機能追加より安定版仕上げを優先し、表形式入力モード、複数ビュー、Media管理、和暦本格解析、標準CSVセットへのnames.csv/places.csv追加、Source/Citation/Name/Place詳細画面などをv1.1以降の候補として整理。 |

---

## 0. 本仕様書の位置づけ

本仕様書は、日本の戸籍調査に適した家系図作成アプリ **Kakeizu Studio** を開発・保守するための詳細仕様書である。

本アプリは、単に人物を線でつなぐ「家系図作図アプリ」ではない。人物、婚姻・パートナー関係、親子関係、出来事、出典、戸籍資料、確度、確認状態、異説、インポート履歴、表示・出力・公開用設定を管理し、そのデータから家系図を自動生成する **家系データ管理アプリ** として設計する。

Version 1.5.1 では、Version 1.5 の実装反映内容を維持しつつ、最初期仕様書で初期版または将来版として想定していた項目を、現在実装との整合に合わせて v1.0.0 以降の方針として整理する。

v0.9.0 時点では、以下が実装済みまたは最小版実装済みである。

- CSVから家系図を作るMVP
- Person / Union / ParentChildRelation の基本管理
- Source / Citation の最小管理
- Event モデルとEvent入力
- 戸籍入力モード最小版
- 関係単位Citation
- 関係削除・関係編集
- 検証エンジンとValidationPanel
- 家系図SVG表示
- 家系図ノード表示密度切替
- 関係線の種類・状態表示
- CSV / 標準CSVセット / JSON / PNG / PDF / SVG 出力
- 共通選択・ジャンプ基盤
- Person一覧・検索
- Event一覧・検索
- Source / Citation一覧・検索
- Citation対象名表示
- Sourceクリックによる関連Citation絞り込み
- ValidationPanelからの対象移動
- 一覧・検索UI仕上げ
- CSVインポート結果プレビュー強化
- 取込方式選択
- 既存 external_id 照合プレビュー
- 参照先不明検出
- 仮人物作成方針プレビュー
- 標準CSVセット検証強化
- ImportBatch最小版
- インポート結果レポート
- Projectモデル最小版
- ViewSetting最小版
- ExportSetting最小版
- PrivacySetting相当の最小版
- 表示設定・出力設定のDB永続化
- 公開用出力モード最小版
- JSON backup schema_version 1.4
- Dexie schema version(5)
- Nameモデル最小版
- Placeモデル最小版
- PersonとNameの最小連携
- Event / Source とPlaceの最小連携
- Name / Place一覧・検索最小版
- Citation target_type=name/place の安全表示・検証
- Place追加・編集・削除の最小導線
- Event.place_id / Source.place_id 参照切れ検証
- 左側パネル縦長化への最低限対応
- スマホ幅での一覧・検索UI最低限対応

一方、以下は将来対応または本格対応前の段階である。

- 全置換以外のCSV実保存
- external_id によるCSV実更新
- 既存スキップの実保存
- 別ID追加の実保存
- 仮人物の実保存
- 参照先不明の自動補完
- ImportBatch詳細画面
- ImportBatch削除・編集
- 詳細ImportReportのDB永続保存
- 行単位ログ保存
- 完全な複数Project切替
- Project削除・複製
- Person / Union / ParentChildRelation / Event / Source / Citation への project_id 付与
- Projectごとのデータ分離
- 公開用CSV出力
- 公開用JSONバックアップ
- 公開用PDF専用レイアウト
- 生存者判定の高度化
- 添付ファイル・戸籍画像のマスク
- 画面凡例と出力凡例の完全分離
- Name詳細専用画面
- Place詳細専用画面
- Name / Place の本格管理
- Media の本格管理
- 表形式入力モード / 一括編集
- 複数ビュー（縦型、横型、直系祖先図、子孫図等）
- 和暦本格解析・和暦入力補助
- 標準CSVセットへの names.csv / places.csv / media.csv 追加
- Event詳細編集UIへの本格ジャンプ
- Source詳細画面
- Citation詳細画面
- Source / Citation issueからの直接ジャンプ
- 一括編集
- 本格ソート
- ページネーション
- 仮想スクロール
- GEDCOM対応
- 親等計算
- 相続関係説明図
- OCR / AIによる戸籍読み取り支援
- ELK.js / React Flow / 複数ビュー本格対応

---

# 第1部：基本方針

## 1. アプリ名

正式名称は **Kakeizu Studio** とする。

日本語では「戸籍・出典管理対応 家系図作成アプリ」と説明する。

本アプリは、家系図をきれいに描くことだけでなく、戸籍・出典・確度・異説・インポート履歴・表示設定・公開設定を管理し、調査データとして育てられることを重視する。

---

## 2. 開発目的

本アプリの目的は、以下の流れを実現することである。

```text
CSV一括投入
↓
人物・親子・婚姻データの正規化
↓
取込前プレビュー・検証・照合
↓
戸籍資料・出典・Event・関係根拠の登録
↓
検証機能による矛盾・未確認・出典なし確認
↓
検索・一覧から対象データを探す
↓
家系図自動生成
↓
表示設定・出力設定・公開用出力設定の調整
↓
画面上で確認・修正
↓
PNG / PDF / SVG / CSV / JSON 出力
↓
将来的にName / Place本格管理、GEDCOM、親等計算、AI/OCRへ拡張
```

特に、次のユースケースを重視する。

1. 自分の家系を戸籍・除籍・改製原戸籍から整理する。
2. ExcelやCSVで整理した家系データを取り込む。
3. ChatGPT等で調査・整理した歴史上人物の家系をCSV化し、一括インポートする。
4. 天皇家、武家、旧家、有名一族などの公開情報を家系図として可視化する。
5. 親族に見せるためのPDF・PNG・SVG家系図を作成する。
6. 調査根拠や出典を後から追加して、信頼性の高い家系データベースに育てる。
7. AI生成データを未確認データとして取り込み、後から検証・修正する。
8. 取込前に、重複、参照先不明、既存 external_id 一致、警告、エラーを確認する。
9. 公開・共有用の家系図出力時に、生存者や非公開人物の表示を最低限マスクする。

---

## 3. 基本コンセプト

本アプリの基本思想は、**「家系図を直接描く」のではなく、「家系データを管理し、そこから家系図を生成する」**ことである。

内部データは単純なツリー構造ではなく、人物・関係・出来事・出典・インポート履歴・表示設定を分離したグラフ構造で保持する。

### 3.1 本アプリで扱う主要概念

| 概念 | v0.9.0時点の扱い |
|---|---|
| Project | 最小版実装済み。現時点では単一default project相当。設定管理の器として扱う。完全な複数Project切替やデータ分離は未対応。 |
| Person | 実装済み。人物基本情報・人物詳細・人物一覧・検索を管理。 |
| Name | 最小版実装済み。Personに紐づく別名・旧名・通称などの追加情報として扱う。Person表示名の完全置換ではない。 |
| Union | 実装済み。婚姻・パートナー関係・不明な親組み合わせを管理。専用一覧は将来対応。 |
| ParentChildRelation | 実装済み。親子関係を人物から分離して管理。専用一覧は将来対応。 |
| Event | 実装済み。出生・死亡・婚姻・離婚・養子縁組・転籍等を管理し、Event一覧・検索を提供。 |
| Source | 実装済み。戸籍・Web・書籍・AI生成データ等の資料を管理し、Source一覧・検索を提供。 |
| Citation | 実装済み。人物・Event・Union・Relationへの根拠付けを管理し、Citation一覧・対象名表示・検索を提供。 |
| Place | 最小版実装済み。Event / Sourceから任意参照できる場所の正規化・再利用候補として扱う。既存place_text等の完全置換ではない。 |
| Media | 将来対応。 |
| ImportBatch | 最小版実装済み。取込日時、取込方式、件数、warning/error、参照先不明数、仮人物候補数等を管理。 |
| ImportReport | 画面表示用の最小版実装済み。DB永続保存は未対応。 |
| ViewSetting | 最小版実装済み。表示密度と画面凡例設定をProjectに紐づけて保存する。 |
| ExportSetting | 最小版実装済み。出力タイトル、出力凡例、背景をProjectに紐づけて保存する。 |
| PrivacySetting | 最小版実装済み。公開用出力モードとマスク方針をProjectに紐づけて保存する。 |

### 3.2 重要な設計思想

- 人物と親子関係を分ける。
- 人物と婚姻・配偶者関係を分ける。
- 親子関係には種別を持たせる。
- 婚姻・パートナー関係はUnionとして独立させる。
- 出典は人物単位ではなく、事実単位に紐づける。
- CSV上のIDとアプリ内部IDを分離する。
- external_id はCSVや外部管理上の照合キーとして扱う。
- 標準CSVセットのCSV上の id は取込時の識別子であり、それだけで既存データ更新候補にしない。
- 家系図はツリーではなく、PersonノードとUnionノードを持つ有向グラフとして扱う。
- AI生成データは最初から確定扱いしない。
- 表示用データと保存用データを分離する。
- 編集用ビューと出力用ビューを分離する。
- 公開用出力モードは表示・出力時マスクであり、元Personデータ、CSV出力、JSONバックアップ、標準CSVセット出力を勝手にマスクしない。
- v0.8.0時点のProjectは設定管理の器であり、Person等への project_id 付与や完全なデータ分離は行わない。
- Name / Placeはv0.9.0時点では既存フィールドを置き換えず、横付けの追加モデルとして扱う。
- Person.display_name、Event.place_text、Source.honseki_text、Source.repositoryは維持する。
- JSONバックアップではName / Placeを保存・復元するが、標準CSVセットではName / Place実体をまだ入出力しない。
- ローカルファーストで個人情報を安全に扱う。
- MVPでは実装負荷を抑え、段階的に拡張する。

---

## 4. 想定ユーザー

### 4.1 メインユーザー

- 自分の家系を調べたい一般ユーザー
- 戸籍・除籍・改製原戸籍を読みながら家系図を作りたいユーザー
- 親族向けに見やすい家系図を作りたいユーザー
- 郷土史、名字、先祖調査、旧家調査に興味があるユーザー
- ChatGPT等で作成したCSVから歴史人物の家系図を作りたいユーザー

### 4.2 サブユーザー

- 行政書士、司法書士、弁護士など相続関係を整理する実務者
- 家系図作成代行業者
- 歴史研究者、郷土史研究者
- 教材用に歴史人物の系図を作りたい人
- 創作・小説・ゲーム設定用に系図を作りたい人

---

# 第2部：技術スタック

## 5. 基本技術方針

本アプリは、ローカルファーストPWAとして開発する。

初期版ではクラウド同期やログイン機能を持たせず、ブラウザ内のIndexedDBに保存する。データはユーザー操作によりJSON、CSV、ZIP形式でバックアップ・復元できるようにする。

---

## 6. 採用技術

| 領域 | 採用技術 | 方針 |
|---|---|---|
| フロントエンド | React + TypeScript + Vite | 採用 |
| ローカルDB | IndexedDB + Dexie.js | 採用 |
| CSV処理 | PapaParse | 採用 |
| バリデーション | Zod / 独自検証 | 採用 |
| テスト | Vitest | 採用。v0.9.0時点では安定実行のため `vitest run --pool=threads --fileParallelism=false` を使用。 |
| 家系図描画 | SVG | 採用 |
| レイアウト計算 | MVPは簡易独自、将来ELK.js | 採用 |
| 編集用グラフUI | React + SVG、将来React Flow検討 | 段階導入 |
| PDF出力 | html2canvas + jsPDF | 暫定採用 |
| PNG出力 | html2canvasベース | 採用 |
| SVG出力 | DOM clone + foreignObject方式の最小版 | v0.5.0で実装済み |
| バックアップ | JSON / 標準CSVセットZIP | 採用 |
| PWA | Manifest / GitHub Pages対応 | 採用 |

---

## 7. SVG出力方針

v0.9.0時点で、SVG出力は最小版として実装済みである。

現行方式は、表示中の家系図DOMをcloneし、`data-html2canvas-ignore="true"` が付いた操作UIを除外したうえで、`foreignObject` を含むSVG文字列として保存する方式である。

### 7.1 SVG出力に含めるもの

- 出力タイトル
- 家系図本体
- 関係線凡例
- 背景設定
- 公開用出力モードON時のマスク済み表示

### 7.2 SVG出力から除外するもの

- 拡大縮小などの操作ツールバー
- 出力用見た目設定UI
- PNG/PDF/SVG出力ボタン
- 入力フォームやselectなどの操作UI

### 7.3 制限

- `foreignObject` を利用するため、SVGビューアや印刷環境によってHTML部分の再現性に差がある。
- 外部CSSの完全な取り込みは未対応。
- 印刷品質向けの完全調整は未対応。
- transparent背景はSVG上では透明扱いであり、画面プレビューの市松模様とは完全一致しない。
- 画面凡例と出力凡例は、現行DOMキャプチャ方式では連動扱いである。完全分離は将来対応とする。
- 将来的には、専用SVGレンダラーやstyle埋め込み強化を検討する。

---

# 第3部：開発フェーズと現在到達点

## 8. 実装済みロードマップ

v0.9.0時点の実装済みロードマップは以下である。

| バージョン | 内容 | 状態 |
|---|---|---|
| v0.1.0 | CSVから家系図を作るMVP | 完了 |
| v0.2.0 | 戸籍入力・Event・出典管理 | 完了 |
| v0.3.0 | 関係根拠・関係編集削除 | 完了 |
| v0.4.0 | データ検証・日付年齢チェック | 完了 |
| v0.5.0 | 家系図表示・出力の見栄え強化 | 完了 |
| v0.6.0 | 検索・一覧・検証結果からの修正導線 | 完了 |
| v0.7.0 | CSVインポート本格化 | 完了 |
| v0.8.0 | Project / 表示設定 / 出力設定 / プライバシー設定 | 完了 |
| v0.9.0 | Name / Place 最小版 | 完了 |

### 8.1 v0.1.0 実装済み内容

- React + TypeScript + Vite基盤
- GitHub Pages対応
- Dexie / IndexedDB保存
- Person / Union / ParentChildRelation
- CSVインポート
- 日本語列名マッピング
- CSVプレビュー・検証
- JSONバックアップ / 復元
- 標準CSVセット入出力
- Source / Citation
- SVG家系図表示
- Unionノード方式
- 拡大縮小 / 全体表示 / リセット / ドラッグ
- 人物詳細編集
- CSV / JSON / PNG / PDF 出力

### 8.2 v0.2.0 実装済み内容

- 戸籍入力モード最小版
- Source作成
- Person Citation自動作成
- Eventモデル
- Event追加・編集・削除
- Event Citation
- 戸籍入力モードから出生・死亡・婚姻・離婚・養子縁組・認知・入籍・除籍・転籍・改名・居住・職業・称号などのEvent作成

### 8.3 v0.3.0 実装済み内容

- 関係単位Citation
- ParentChildRelation / Union へのCitation付与
- 関係Citation複数表示
- 関係削除UI
- 関係編集UI
- 関係削除時のCitation削除
- 親子関係・Union属性編集

### 8.4 v0.4.0 実装済み内容

- 検証エンジン
- ValidationPanel
- severity / category / target_type フィルタ
- 出典なし、未確認、低確度、参照切れ、自己参照、日付矛盾、年齢警告
- 日付・年齢チェック強化
- 4桁西暦抽出

### 8.5 v0.5.0 実装済み内容

- 家系図ノード表示強化
- `FamilyTreeDisplayMode = 'compact' | 'standard' | 'detailed'`
- compact / standard / detailed 表示切替
- 人物ノードへの生没年表示
- Person Citation有無表示
- confidence / review_status 表示
- 出典なし・未確認・低確度・異説ありのノード強調
- 親子関係の `relation_type` に応じた関係線表示
- Unionの `union_type` / `status` / `end_reason` に応じた関係線表示
- confidence / review_status の関係線反映
- Unionノードへの状態反映
- 関係線凡例
- 出力用見た目設定
- PNG/PDF出力時の操作UI除外
- SVG出力最小版

### 8.6 v0.6.0 実装済み内容

v0.6.0では、「検索・一覧・検証結果からの修正導線」を実装した。

- 共通選択・ジャンプ基盤
- Person一覧・検索
- Event一覧・検索
- Source / Citation一覧・検索
- Citation対象名表示
- Sourceクリックによる関連Citation絞り込み
- ValidationPanelからの対象移動
- 共通list系CSS
- 左側パネル縦長化対応
- スマホ表示最低限対応

### 8.7 v0.7.0 実装済み内容

v0.7.0では、「CSVインポート本格化」を実装した。

- CSVインポート現状棚卸し
- `docs/csv_import_audit_v0.7.md` 追加
- インポート結果プレビュー強化
- 取込方式選択
- `ImportPolicy`
  - `replace_all`
  - `append_new`
  - `update_by_external_id`
  - `skip_existing`
  - `add_as_new_ids`
- `replace_all` のみ実行可能
- その他は `preview_only`
- 既存 external_id 照合プレビュー
- `ImportMatchSummary`
- `ImportPolicyPlan`
- 参照先不明検出
- 仮人物作成方針
- `PlaceholderPersonPolicy`
  - `warn_and_skip`
  - `block_import`
  - `create_placeholder_preview`
- `warn_and_skip` のみ実行可能
- 標準CSVセット検証強化
- ImportBatch最小版
- インポート結果レポート
- v0.7.0リリース固定

### 8.8 v0.8.0 実装済み内容

v0.8.0では、「Project / 表示設定 / 出力設定 / プライバシー設定」を実装した。

#### 8.8.1 Project / 設定系の現状棚卸し

- `docs/settings_audit_v0.8.md` 追加
- 表示密度、出力タイトル、凡例、背景、privacy関連項目の棚卸し
- Projectは当面単一default project相当で扱う方針を整理
- Person等への project_id 付与は今回しない方針を整理
- JSON backup互換性方針を整理
- Dexie schema変更方針を整理

#### 8.8.2 Projectモデル最小版

- `Project` モデル追加
- default project「既定プロジェクト」を作成・読み込み
- Projectは設定管理の器として扱う
- 完全な複数Project切替は未対応
- Project削除・複製は未対応
- Person / Union / ParentChildRelation / Event / Source / Citation への project_id 一括追加は未対応

#### 8.8.3 ViewSetting最小版

- `ViewSetting` モデル追加
- `tree_display_mode`
- `show_relation_legend`
- 表示密度の保存・復元
- 画面上の関係線凡例表示の設定管理
- default値は既存挙動に合わせて `standard` / `true`

#### 8.8.4 ExportSetting最小版

- `ExportSetting` モデル追加
- `show_title`
- `title`
- `show_legend`
- `background`
- 出力タイトル表示ON/OFF、タイトル、出力凡例、背景の保存・復元
- default値は既存挙動に合わせて、タイトル表示ON、タイトル「家系図」、凡例ON、背景white

#### 8.8.5 出力設定のDB永続化

- App起動時に Project / ViewSetting / ExportSetting / PrivacySetting を読み込む
- 存在しない場合はdefault project/settingsを作成する
- UI操作時に設定を即DB保存する
- 保存失敗時はconsole errorに留め、画面操作を致命的に壊さない
- PNG/PDF/SVG出力の既存方式を維持

#### 8.8.6 PrivacySetting相当

- `PrivacySetting` モデル追加
- `public_output_mode`
- `hide_living_persons`
- `hide_private_persons`
- `hide_hidden_persons`
- `hide_honseki`
- `mask_living_dates`
- defaultは `public_output_mode: false`
- 通常表示は既存挙動を維持
- 公開用出力モードON時のみ表示・出力時マスクを適用

#### 8.8.7 公開用出力モード最小版

- 公開用出力モードON/OFF UI
- 生存者日付マスク設定
- hidden / private 人物の「非公開」表示
- 生存者日付の「生存中」表示
- `rank_title` / `occupation` / `honseki_text` / `note` の表示用マスク
- 元PersonオブジェクトやDB上のPersonデータは書き換えない
- PNG/PDF/SVGは表示中DOMを出力するため、公開用出力モードON時はマスク済み表示が出力対象になる

#### 8.8.8 JSONバックアップ互換性確認

- JSON backup `schema_version` を `1.3` に更新
- Project / ViewSetting / ExportSetting / PrivacySetting をJSON backupに含める
- JSON 1.0 / 1.1 / 1.2 / 1.3 の復元互換を維持
- 古いJSON復元時にdefault project/settingsを補完
- Person / Union / ParentChildRelation / Event / Source / Citation 既存データを壊さない

#### 8.8.9 補完フェーズ

- ViewSetting.show_relation_legend と ExportSetting.show_legend の責務整理
- 現行DOMキャプチャ方式では画面凡例と出力凡例は連動扱い
- 公開用出力モードON時の詳細表示マスク補完
- Vitestのfork pool停止対策として、test scriptを `vitest run --pool=threads --fileParallelism=false` に整理

#### 8.8.10 v0.8.0リリース固定

- package version `0.8.0`
- Appヘッダー `Version 0.8.0`
- README冒頭 `Version 0.8.0`
- RELEASE_NOTES v0.8.0 追加
- GitHub Pages確認URL `?v=0.8.0`
- JSON backup `schema_version` は `1.3`
- Dexie schema versionは `version(1)`〜`version(4)`
- Dexie schema version(5)は追加しない
- 標準CSVセット構造変更なし


### 8.9 v0.9.0 実装済み内容

v0.9.0では、「Name / Place 最小版」を実装した。

#### 8.9.1 Name / Place現状棚卸し

- `docs/name_place_audit_v0.9.md` 追加
- Person内の表示名・姓・名・かな・旧姓など、名前情報の所在を整理
- Event.place_text、Source.honseki_text、Source.repositoryなど、場所情報の所在を整理
- 既存フィールドを削除せず、Name / Placeを横に追加する方針を整理
- JSON backup 1.4、Dexie schema version(5)、標準CSVセット非変更の方針を整理

#### 8.9.2 Nameモデル最小版

- `NameType` 追加
- `Name` モデル追加
- Dexie `names` テーブル追加
- `person_id` によりPersonへ紐づけ
- NameはPerson表示名の完全置換ではなく、別名・旧名・通称などの追加情報として扱う
- Person.display_name / family_name / given_name / birth_family_name 等は維持

#### 8.9.3 PersonとNameの最小連携

- Person詳細パネルに「名前・別名」セクションを追加
- Personに紐づくName一覧表示
- Name追加・編集・削除の最小導線
- Name編集時にPerson本体を勝手に上書きしない
- Name削除時にPerson本体を削除しない
- Name一覧から関連Personへ移動する導線

#### 8.9.4 Placeモデル最小版

- `PlaceType` 追加
- `Place` モデル追加
- Dexie `places` テーブル追加
- Placeは既存場所テキストの完全置換ではなく、場所の正規化・再利用候補として扱う
- Event.place_text / Source.honseki_text / Source.repository は維持

#### 8.9.5 Event / Source とPlaceの最小連携

- Eventに任意の `place_id` を追加
- Sourceに任意の `place_id` を追加
- Event.place_text は表示用場所テキストとして維持
- Source.honseki_text / repository は維持
- Event / SourceのPlace参照は参照切れでも画面が壊れないよう安全に扱う

#### 8.9.6 Name / Place一覧・検索最小版

- Name / Place一覧パネル追加
- Name検索・typeフィルタ
- Place検索・typeフィルタ
- 件数表示・0件表示
- Nameクリックによる関連Person移動
- Placeは詳細画面なしでも安全表示

#### 8.9.7 Citation target_type name / place の準備

- Citation target_type `name` / `place` を安全表示
- Source / Citation一覧でName / Place対象名を解決表示
- name / place target_id参照切れでも落ちない
- Validationでname/place Citation参照切れを検出
- Citation編集UIでのname/place本格選択は将来対応

#### 8.9.8 JSONバックアップ・DB互換性確認

- JSON backup `schema_version` を `1.4` に更新
- `names` / `places` をJSONバックアップに含める
- 1.0 / 1.1 / 1.2 / 1.3 の復元互換を維持
- 古いJSONではnames / placesを空配列補完
- Project / ViewSetting / ExportSetting / PrivacySetting補完を維持
- Dexie schema version(5)でnames / placesを追加
- version(1)〜version(4)は維持

#### 8.9.9 補完フェーズ

- Place追加・編集・削除フォームをName / Place一覧パネルに追加
- Place削除時はEvent / Source本体を削除せず、Event.place_id / Source.place_idをクリア
- Event.place_text / Source.honseki_text / Source.repositoryは維持
- Place向けCitationは削除または安全に扱う
- Event.place_id / Source.place_id参照切れをValidation warningとして検出
- JSONバックアップではName / Placeを扱い、標準CSVセットではName / Place実体を扱わない境界を明文化

#### 8.9.10 v0.9.0リリース固定

- package version `0.9.0`
- Appヘッダー `Version 0.9.0`
- README冒頭 `Version 0.9.0`
- RELEASE_NOTES v0.9.0 追加
- GitHub Pages確認URL `?v=0.9.0`
- JSON backup `schema_version` は `1.4`
- Dexie schema versionは `version(1)`〜`version(5)`
- Dexie schema version(6)は追加しない
- 標準CSVセット構造変更なし
- names.csv / places.csv 追加なし

---

## 9. 今後のロードマップ

v0.9.0までで、基本的な家系データ管理、家系図表示・出力、検索・一覧・修正導線、CSVインポートの取込前プレビュー・検証・履歴・結果レポート、Project/settingsの最小永続化、公開用出力モード最小版、Name / Place最小版まで到達した。

今後は、v1.0.0として安定版仕上げに進む。

| バージョン | 内容 |
|---|---|
| v1.0.0 | 戸籍・出典管理対応の安定版 |
| v1.1以降 | GEDCOM、親等計算、相続関係説明図、OCR/AI支援、複数Project本格対応、複数ビュー本格対応、Name / Place / Media本格管理 |

### 9.1 v1.0.0 の目標：安定版仕上げ

v1.0.0では、戸籍・出典管理対応の安定版として、v0.1.0〜v0.9.0の全体整合を整える。

主な対象は以下である。

- README / RELEASE_NOTES整理
- 仕様書のv1.0到達反映
- テスト整理
- サンプルデータ整備
- GitHub Pages公開確認
- バックアップ互換性確認
- 主要導線の手動確認
- 既知の未対応事項の棚卸し
- v1.0.0リリース固定

### 9.2 v1.0.0で優先すること

v1.0.0では、新機能追加よりも、v0.1.0〜v0.9.0で到達した機能群を安定版として整えることを優先する。

優先対象は以下である。

- v0.1.0〜v0.9.0到達点の棚卸し
- README / RELEASE_NOTES / 仕様書の整合
- サンプルデータ整備
- JSONバックアップ互換性確認
- 標準CSVセット互換性確認
- 主要導線の手動確認リスト整備
- テスト整理
- GitHub Pages公開確認
- 既知の未対応事項の明文化
- v1.0.0リリース固定

v1.0.0では、表形式入力モード、複数ビュー、Media管理、標準CSVセット拡張、GEDCOM、親等計算などの大きな新機能は原則として追加しない。

### 9.3 v1.0.0では追加しないが、v1.1以降へ送る項目

最初期仕様書では初期版または早期対応候補として記載していたが、現在の実装方針では v1.0.0 には入れず、v1.1以降で段階的に検討する項目を以下に整理する。

#### 9.3.1 入力・編集系

- 表形式入力モード
- Excel風セル編集
- コピー＆ペーストによる連続入力
- 一括編集
- 一括置換
- 本格ソート
- ページネーション
- 仮想スクロール
- Source詳細画面
- Citation詳細画面
- Name詳細専用画面
- Place詳細専用画面
- Source編集UIでのPlace選択
- Citation編集UIでのname/place本格選択

#### 9.3.2 表示・ビュー系

- 縦型家系図の本格調整
- 横型家系図
- 直系祖先図
- 子孫図
- 扇形図
- 砂時計図
- 親族図
- 相続関係図風ビュー
- 旧家系図風縦書きビュー
- ELK.js / React Flowを使った複数ビュー本格対応

#### 9.3.3 データモデル・バックアップ系

- 標準CSVセットへの names.csv 追加
- 標準CSVセットへの places.csv 追加
- 標準CSVセットへの media.csv 追加
- 標準CSVセットでのName / Place実体入出力
- Media管理
- 添付ファイル管理
- 戸籍画像・PDF管理
- ZIPバックアップでのmedia同梱
- Projectごとのデータ分離
- Person / Union / ParentChildRelation / Event / Source / Citation への project_id 付与
- 完全な複数Project切替

#### 9.3.4 日本語・戸籍特化系

- 和暦本格解析
- 和暦・西暦変換UI
- 江戸以前の暦対応
- 続柄表示の高度化
- 戸籍画像添付
- 添付ファイル・戸籍画像の公開用マスク

#### 9.3.5 外部連携・実務系

- GEDCOMインポート / エクスポート
- 親等計算
- 法定相続人候補表示
- 相続関係説明図
- OCR / AIによる戸籍読み取り支援
- クラウド同期
- 共同編集

### 9.4 v1.1以降の進め方

v1.1以降では、v1.0.0安定版を土台に、以下のような単位で小さく段階実装する。

- v1.1候補：表形式入力 / 一括編集の最小版
- v1.2候補：Source / Citation / Name / Place詳細画面
- v1.3候補：標準CSVセット拡張（names.csv / places.csv）
- v1.4候補：Media / 添付ファイル管理
- v1.5候補：複数ビュー本格対応
- v1.6以降候補：GEDCOM、親等計算、相続関係説明図、OCR / AI支援

実際の順序は、v1.0.0リリース後の使用感、未対応事項の重要度、実装リスク、テスト容易性を見て決める。

---

# 第4部：データモデル

## 10. ID設計

本アプリでは、すべての主要データに内部IDと外部IDを分けて持たせる。

| ID | 用途 |
|---|---|
| id | アプリ内部の主キー。UUIDまたはnanoid相当。 |
| external_id | CSVや人間向けのID。P001、TENNO_001など。取込時の照合キー。 |
| import_batch_id | どのインポート由来かを示すID。 |
| project_id | v0.8.0時点ではViewSetting / ExportSetting / PrivacySetting用。Person等への一括付与は未対応。 |

CSVで指定される `P001` のようなIDを内部主キーにすると、複数CSV取り込み時やプロジェクト統合時に衝突するため、内部IDはアプリが自動生成する。

v0.7.0以降では、取り込み前プレビューで `external_id` による既存データ照合を行う。ただし、全置換以外の実保存は未対応である。

v0.9.0時点では、Projectは設定管理の器であり、人物・関係・出来事・出典のデータ分離単位ではない。

v0.9.0時点では、Name / Placeにも内部IDを持たせる。NameはPersonに `person_id` で紐づき、PlaceはEvent / Sourceから任意の `place_id` で参照される。

---

## 11. Person

人物情報を管理する。

| 項目 | 必須 | 内容 |
|---|---|---|
| id | 必須 | 内部ID |
| external_id | 任意 | CSV等の外部ID。かんたんCSVでは person_id 由来。 |
| display_name | 必須 | 表示名 |
| family_name | 任意 | 姓 |
| given_name | 任意 | 名 |
| family_name_kana | 任意 | 姓かな |
| given_name_kana | 任意 | 名かな |
| birth_family_name | 任意 | 旧姓 |
| gender | 任意 | male / female / unknown / other |
| birth_date_text | 任意 | 表示用生年月日 |
| birth_date_from | 任意 | 検索用開始日 |
| birth_date_to | 任意 | 検索用終了日 |
| death_date_text | 任意 | 表示用没年月日 |
| death_date_from | 任意 | 検索用開始日 |
| death_date_to | 任意 | 検索用終了日 |
| honseki_text | 任意 | 本籍メモ |
| occupation | 任意 | 職業 |
| rank_title | 任意 | 称号、官位、爵位 |
| generation_no | 任意 | 代数 |
| is_living | 任意 | true / false / unknown |
| privacy_level | 任意 | public / private / hidden |
| confidence | 任意 | confirmed / likely / uncertain / disputed |
| review_status | 任意 | unreviewed / reviewed / rejected |
| note | 任意 | 備考 |
| import_batch_id | 任意 | インポート履歴ID |
| created_at | 必須 | 作成日時 |
| updated_at | 必須 | 更新日時 |

v0.9.0時点では、Personに `project_id` は付与しない。将来の複数Project本格対応時に検討する。

---

## 12. Union

婚姻、内縁、パートナー関係、離婚、死別、不明な親組み合わせを管理する。

| 項目 | 必須 | 内容 |
|---|---|---|
| id | 必須 | 内部ID |
| external_id | 任意 | 外部ID |
| partner1_id | 必須 | パートナー1 |
| partner2_id | 任意 | パートナー2 |
| union_type | 必須 | marriage / partner / concubine / unknown / other |
| marriage_date_text | 任意 | 婚姻日 |
| divorce_date_text | 任意 | 離婚日 |
| end_date_text | 任意 | 終了日 |
| end_reason | 任意 | divorce / death / unknown / other |
| status | 任意 | married / divorced / widowed / ended / unknown |
| confidence | 任意 | confirmed / likely / uncertain / disputed |
| review_status | 任意 | unreviewed / reviewed / rejected |
| note | 任意 | 備考 |
| import_batch_id | 任意 | インポート履歴ID |
| created_at | 必須 | 作成日時 |
| updated_at | 必須 | 更新日時 |

`partner2_id` は任意とする。父不明、母不明、配偶者名不詳、片親Unionなどを表現するためである。

---

## 13. ParentChildRelation

親子関係を管理する。

| 項目 | 必須 | 内容 |
|---|---|---|
| id | 必須 | 内部ID |
| external_id | 任意 | 外部ID |
| parent_id | 必須 | 親人物ID |
| child_id | 必須 | 子人物ID |
| union_id | 任意 | どのUnionの子か |
| relation_type | 必須 | biological / adoptive / special_adoptive / step / recognized / foster / unknown / disputed |
| start_date_text | 任意 | 関係開始日 |
| end_date_text | 任意 | 関係終了日 |
| confidence | 任意 | confirmed / likely / uncertain / disputed |
| review_status | 任意 | unreviewed / reviewed / rejected |
| note | 任意 | 備考 |
| import_batch_id | 任意 | インポート履歴ID |
| created_at | 必須 | 作成日時 |
| updated_at | 必須 | 更新日時 |

### 13.1 親子関係種別

| 種別 | 意味 |
|---|---|
| biological | 実親子 |
| adoptive | 養親子 |
| special_adoptive | 特別養子 |
| step | 継親子 |
| recognized | 認知 |
| foster | 養育関係 |
| unknown | 不明 |
| disputed | 異説あり |

---

## 14. Event

出生、死亡、婚姻、離婚、養子縁組、認知、入籍、除籍、転籍、改名、居住、職業、称号などを管理する。

v0.9.0時点では、Eventは `target_type` と `target_id` を持ち、person / union / relation を対象にできる設計で実装されている。Event一覧から対象へ移動する最小導線も実装済みである。また、既存の `place_text` を維持したまま、任意でPlaceを参照する `place_id` を持てる。

| 項目 | 内容 |
|---|---|
| id | 内部ID |
| external_id | 外部ID |
| event_type | 出来事種別 |
| target_type | person / union / relation |
| target_id | 対象ID |
| date_text | 表示用日付 |
| date_from | 開始日 |
| date_to | 終了日 |
| place_text | 場所テキスト |
| place_id | 任意のPlace参照ID。v0.9.0で追加。 |
| description | 内容 |
| confidence | 確度 |
| review_status | 確認状態 |
| note | 備考 |
| import_batch_id | インポート履歴ID |

### 14.1 主な出来事種別

- birth
- death
- marriage
- divorce
- adoption
- recognition
- entry_registry
- removal_registry
- transfer_registry
- name_change
- residence
- occupation
- title
- other

---

## 15. Source

戸籍、除籍、改製原戸籍、写真、墓碑、聞き取り、文献、Webページ、AI生成データなどの資料を管理する。

| 項目 | 内容 |
|---|---|
| id | 内部ID |
| external_id | 外部ID |
| source_type | 資料種別 |
| title | 資料名 |
| author_or_issuer | 発行者・作成者 |
| issued_date_text | 発行日 |
| obtained_date | 取得日 |
| repository | 保管場所 |
| honseki_text | 本籍 |
| place_id | 任意のPlace参照ID。戸籍資料なら本籍地、文献・資料なら保管場所や関連地などを広く扱う。v0.9.0で追加。 |
| head_of_registry | 筆頭者・戸主 |
| registry_type | 戸籍種別 |
| source_text | 原文メモ |
| url | URL |
| file_ref | 添付ファイル参照 |
| privacy_level | 公開設定 |
| note | 備考 |
| import_batch_id | インポート履歴ID |

### 15.1 資料種別

- current_koseki
- joseki
- kaisei_genkoseki
- family_register_copy
- grave
- temple_record
- interview
- book
- article
- website
- photo
- ai_generated
- other

---

## 16. Citation

Sourceのどの記載が、どの人物・出来事・関係を裏付けるかを管理する。

| 項目 | 内容 |
|---|---|
| id | 内部ID |
| external_id | 外部ID |
| source_id | 資料ID |
| target_type | person / event / union / relation / name / place |
| target_id | 対象ID |
| page_or_location | ページ・画像番号・記載位置 |
| quote_text | 引用・転記 |
| interpretation | 解釈 |
| confidence | 確度 |
| note | 備考 |
| import_batch_id | インポート履歴ID |

重要仕様：出典は人物単位ではなく、事実単位に紐づける。

v0.9.0時点では `name` / `place` を安全表示・検証対象として扱う。Source / Citation一覧では対象名を解決表示し、参照切れでも画面が壊れないようにする。Validationではname/place Citationの参照切れを検出する。

ただし、Citation編集UIでname/placeを本格選択する機能は未対応である。また、標準CSVセットにはnames.csv / places.csvをまだ追加していないため、標準CSVセット経由でName / Place実体を復元する機能は将来対応である。

---

## 17. ImportBatch

v0.7.0でImportBatch最小版を実装済みである。

ImportBatchは、CSVインポートの履歴を最小限記録する。

| 項目 | 内容 |
|---|---|
| id | ImportBatch ID |
| import_type | 既存互換の取込種別 |
| imported_at | 既存互換の取込日時 |
| mode | simple_csv / standard_csv_set |
| import_policy | replace_all / append_new / update_by_external_id / skip_existing / add_as_new_ids |
| placeholder_person_policy | warn_and_skip / block_import / create_placeholder_preview |
| status | completed / completed_with_warnings / failed / preview_only |
| source_label | かんたんCSV / 標準CSVセット等 |
| file_names | 読み込んだファイル名 |
| total_rows | 総行数 |
| imported_counts | persons / unions / relations / events / sources / citations 件数 |
| warning_count | warning issue件数 |
| error_count | error issue件数 |
| unresolved_reference_count | 参照先不明件数 |
| placeholder_person_candidate_count | 仮人物候補件数 |
| created_at | 作成日時 |
| note | 備考 |

### 17.1 ImportBatch保存対象

v0.8.0時点でImportBatchを保存するのは、実際に取込成功した場合のみである。

実行可能条件は以下である。

```text
importPolicy === replace_all
placeholderPersonPolicy === warn_and_skip
errorなし
```

preview_only方式では保存しない。

全置換時は既存保存フローに合わせ、ImportBatch履歴も置き換わる。そのため、現時点では全置換後に最新ImportBatchのみ残る仕様である。

---

## 18. ImportReport

v0.7.0でインポート結果レポート最小版を実装済みである。

ImportReportは、ImportBatchとImportPreviewResultから生成する画面表示用データであり、DBには永続保存しない。

| 項目 | 内容 |
|---|---|
| id | レポートID |
| batchId | 関連ImportBatch ID |
| status | success / success_with_warnings / blocked / preview_only |
| mode | simple_csv / standard_csv_set |
| importPolicy | 取込方式 |
| placeholderPersonPolicy | 仮人物作成方針 |
| sourceLabel | 取込元 |
| fileNames | 読み込んだファイル |
| createdAt | 作成日時 |
| importedCounts | 取込件数 |
| issueSummary | warning / error / total |
| matchSummary | external_id照合概要 |
| policyPlan | 取込方式別予定処理 |
| unresolvedReferenceSummary | 参照先不明概要 |
| placeholderPersonCandidateCount | 仮人物候補件数 |
| issuePreview | 主なissue |
| unresolvedReferencePreview | 主な参照先不明 |
| placeholderPersonCandidatePreview | 主な仮人物候補 |
| nextActions | 次に確認すること |

### 18.1 ImportReportの役割

- 取込成功直後に、ユーザーへ結果を提示する。
- warning付き成功かどうかを分かりやすく示す。
- 参照先不明、仮人物候補、既存 external_id 一致を確認できるようにする。
- ValidationPanel、家系図、人物詳細などの次確認先を案内する。

### 18.2 制限

- DB永続保存はしない。
- 詳細レポート画面は未対応。
- 行単位ログ保存は未対応。
- preview_only方式では通常作成しない。

---

## 19. Project

v0.8.0でProjectモデル最小版を実装済みである。

Projectは、現時点ではデータ分離単位ではなく、ViewSetting / ExportSetting / PrivacySetting を束ねる設定管理の器である。

| 項目 | 内容 |
|---|---|
| id | Project ID |
| name | Project名 |
| description | 説明 |
| created_at | 作成日時 |
| updated_at | 更新日時 |

### 19.1 v0.8.0時点の扱い

- default projectを作成・読み込みする。
- default project名は「既定プロジェクト」相当。
- 単一default project相当で運用する。
- 完全な複数Project切替は未対応。
- Project削除・複製は未対応。
- Person等への project_id 一括追加は未対応。
- Projectごとのデータ分離は未対応。

---

## 20. ViewSetting

v0.8.0でViewSetting最小版を実装済みである。

ViewSettingは、画面上の家系図表示に関する設定をProjectに紐づけて保存する。

| 項目 | 内容 |
|---|---|
| id | ViewSetting ID |
| project_id | Project ID |
| tree_display_mode | compact / standard / detailed |
| show_relation_legend | 画面上の関係線凡例表示 |
| created_at | 作成日時 |
| updated_at | 更新日時 |

### 20.1 v0.8.0時点の扱い

- 表示密度をDB保存・復元する。
- 画面凡例表示をDB保存・復元する。
- 初期値は既存挙動に合わせる。
- `show_relation_legend` は画面上の家系図ビューに関係線凡例を表示するかどうかを示す。
- 現行DOMキャプチャ方式では、出力凡例と連動扱いである。

---

## 21. ExportSetting

v0.8.0でExportSetting最小版を実装済みである。

ExportSettingは、PNG / PDF / SVG 出力に関する見た目設定をProjectに紐づけて保存する。

| 項目 | 内容 |
|---|---|
| id | ExportSetting ID |
| project_id | Project ID |
| show_title | 出力タイトル表示ON/OFF |
| title | 出力タイトル |
| show_legend | PNG / PDF / SVG 出力対象に凡例を含めるかどうか |
| background | white / transparent / soft |
| created_at | 作成日時 |
| updated_at | 更新日時 |

### 21.1 v0.8.0時点の扱い

- 出力タイトル表示ON/OFFをDB保存・復元する。
- 出力タイトルをDB保存・復元する。
- 出力凡例設定をDB保存・復元する。
- 背景設定をDB保存・復元する。
- 現行DOMキャプチャ方式では、画面凡例と出力凡例は連動扱いである。
- 画面凡例と出力凡例の完全分離は将来対応とする。

---

## 22. PrivacySetting

v0.8.0でPrivacySetting相当の最小版を実装済みである。

PrivacySettingは、公開用出力モードとマスク方針をProjectに紐づけて保存する。

| 項目 | 内容 |
|---|---|
| id | PrivacySetting ID |
| project_id | Project ID |
| public_output_mode | 公開用出力モードON/OFF |
| hide_living_persons | 生存者を隠す方針 |
| hide_private_persons | private人物を隠す方針 |
| hide_hidden_persons | hidden人物を隠す方針 |
| hide_honseki | 本籍を隠す方針 |
| mask_living_dates | 生存者の日付を隠す方針 |
| created_at | 作成日時 |
| updated_at | 更新日時 |

### 22.1 v0.8.0時点の公開用出力モード

`public_output_mode` OFFのときは、既存表示を維持する。

`public_output_mode` ONのとき、設定に応じて以下を表示・出力時だけマスクする。

- hidden / private 人物の表示名を「非公開」にする。
- 生存者の日付を「生存中」等にする。
- `rank_title` / `occupation` / `honseki_text` / `note` を表示用データから除外する。
- PNG / PDF / SVG は表示中DOMを出力するため、マスク済み表示が出力対象になる。

### 22.2 重要な制限

- 元Personデータは書き換えない。
- CSV出力の元データは勝手にマスクしない。
- JSONバックアップの元データは勝手にマスクしない。
- 標準CSVセット出力の元データは勝手にマスクしない。
- 公開用CSV出力、公開用JSONバックアップ、公開用PDF専用レイアウトは未対応である。
- 生存者判定の高度化、添付ファイル・戸籍画像のマスクは未対応である。

---

## 23. Name / Place / Media

### 23.1 Name

v0.9.0でNameモデル最小版を実装済みである。

Nameは、Person.display_nameを置き換えるものではなく、別名・旧名・通称・幼名・戒名などを追加管理するためのモデルである。

| 項目 | 内容 |
|---|---|
| id | Name ID |
| external_id | 外部ID |
| person_id | 関連Person ID |
| name_type | primary / birth / maiden / alias / childhood / posthumous / courtesy / legal / other |
| name_text | 名前テキスト |
| family_name | 姓 |
| given_name | 名 |
| family_name_kana | 姓かな |
| given_name_kana | 名かな |
| valid_from_text | 使用開始日・期間テキスト |
| valid_to_text | 使用終了日・期間テキスト |
| confidence | 確度 |
| review_status | 確認状態 |
| note | 備考 |
| import_batch_id | インポート履歴ID |
| created_at | 作成日時 |
| updated_at | 更新日時 |

#### 23.1.1 v0.9.0時点の扱い

- Person詳細パネルでName一覧を表示する。
- Person詳細パネルでNameを追加・編集・削除できる。
- Name編集でPerson本体を勝手に上書きしない。
- Name削除でPerson本体を削除しない。
- Name一覧・検索から関連Personへ移動できる。
- Name詳細専用画面は未対応。
- NameとPerson表示名の完全同期は未対応。

### 23.2 Place

v0.9.0でPlaceモデル最小版を実装済みである。

Placeは、Event.place_text、Source.honseki_text、Source.repositoryを置き換えるものではなく、場所の正規化・再利用候補として追加管理するためのモデルである。

| 項目 | 内容 |
|---|---|
| id | Place ID |
| external_id | 外部ID |
| place_type | honseki / birth / death / residence / marriage / burial / repository / event / other |
| name | 場所名 |
| normalized_name | 正規化名 |
| address_text | 住所テキスト |
| country | 国 |
| prefecture | 都道府県 |
| municipality | 市区町村 |
| district | 地区 |
| privacy_level | public / private / hidden |
| confidence | 確度 |
| review_status | 確認状態 |
| note | 備考 |
| import_batch_id | インポート履歴ID |
| created_at | 作成日時 |
| updated_at | 更新日時 |

#### 23.2.1 v0.9.0時点の扱い

- Place一覧・検索・typeフィルタを提供する。
- Placeを追加・編集・削除できる。
- Eventは既存のplace_textを維持したまま、任意でplace_idを持てる。
- Sourceは既存のhonseki_text / repositoryを維持したまま、任意でplace_idを持てる。
- Place編集でEvent.place_textやSource.honseki_text / repositoryを勝手に上書きしない。
- Place削除時はEvent / Source本体を削除せず、関連するplace_idをクリアする。
- Event.place_id / Source.place_idの参照切れはValidation warningとして検出する。
- Place詳細専用画面、地図表示、緯度経度管理、地名階層の本格管理は未対応。

### 23.3 Media

Mediaは将来対応対象である。

写真、戸籍画像、PDF、スキャン画像を管理する。

---

# 第5部：CSV / JSON / バックアップ仕様

## 24. CSV機能の目的

CSVインポート/エクスポートは本アプリの中核機能である。

目的は以下。

- ChatGPT等で作成した家系データを取り込む。
- Excelで整理したデータを取り込む。
- 既存データを外部編集して戻す。
- 大量の人物を一括登録する。
- 歴史人物や天皇家などの公開情報を家系図化する。
- データを人間が読みやすい形でバックアップする。
- 取り込み前に、警告、エラー、参照先不明、既存external_id一致を確認する。

---

## 25. 対応CSV形式

本アプリは2種類のCSV形式に対応する。

1. かんたんCSV
2. 標準CSVセット

v0.9.0時点では、基本的なCSVインポート、標準CSVセット入出力、複数CSV直接インポート、取込前プレビュー、取込方式選択、external_id照合、参照先不明検出、標準CSVセット検証、ImportBatch、ImportReportを実装済みである。

v0.9.0でも標準CSVセット構造は変更していない。Name / PlaceはJSONバックアップには含めるが、標準CSVセットにはnames.csv / places.csvをまだ追加しない。

---

## 26. かんたんCSV

1ファイルだけで取り込める初心者向け形式。

### 26.1 最小列

```text
person_id,name
```

### 26.2 推奨列

```text
person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
```

### 26.3 v0.8.0時点の扱い

- `person_id` は `Person.external_id` として扱う。
- `father_id` / `mother_id` / `spouse_ids` はCSV内の `person_id` と照合する。
- 参照先不明はプレビューに表示する。
- 既存 `Person.external_id` と一致するものは既存一致候補として表示する。
- CSV内の同一 `person_id` 重複は重複候補として表示する。
- `person_id` 空欄は external_idなしとして表示する。
- Source / Citation / Eventの構造化取込は、かんたんCSVでは未対応または最小対応に留める。
- Project / settingsはかんたんCSVには含めない。

---

## 27. 標準CSVセット

複数CSVをZIPまたは複数ファイルとして取り込む本格形式。

### 27.1 ZIP構成

```text
kakeizu_export.zip
├─ manifest.json
├─ persons.csv
├─ unions.csv
├─ parent_child_relations.csv
├─ events.csv
├─ sources.csv
└─ citations.csv
```

### 27.2 v0.9.0時点の必須ファイル

| ファイル | 扱い |
|---|---|
| manifest.json | 必須 |
| persons.csv | 必須 |
| unions.csv | 必須 |
| parent_child_relations.csv | 必須 |
| sources.csv | 必須 |
| citations.csv | 必須 |
| events.csv | 任意。既存互換のため、なくてもerrorにしない。 |

### 27.3 v0.9.0時点の必須列

| ファイル | 必須列 |
|---|---|
| persons.csv | id, name |
| unions.csv | id, partner1_id |
| parent_child_relations.csv | id, parent_id, child_id, relation_type |
| sources.csv | id, source_type, title |
| citations.csv | id, source_id, target_type, target_id |
| events.csv | id, event_type, target_type, target_id |

### 27.4 検証項目

v0.9.0時点で以下を検証する。

- manifest.json の有無
- manifest JSON不正
- manifest format不一致
- manifest version / schema_version不足
- manifest files記載と実ファイル不足
- 必須ファイル不足
- 必須列不足
- 必須値空欄
- 各CSV内の重複ID
- 列挙値不正
- target_type不正
- union partner参照整合
- relation parent / child / union参照整合
- event target参照整合
- citation source / target参照整合
- warningRows / errorRows の `fileName + rowNumber` 単位集計

### 27.5 今後追加候補

将来的には以下を追加する可能性がある。

- names.csv
- places.csv
- media.csv
- project_settings.csv
- view_settings.csv
- export_settings.csv
- privacy_settings.csv

ただし、v0.9.0時点でも標準CSVセット構造は変更していない。names.csv / places.csv は将来候補であり、現行の標準CSVセット入出力には含めない。

---

## 28. 取込方式

v0.9.0時点で、取込方式選択UIを実装済みである。

| 方式 | 表示名 | 状態 | 内容 |
|---|---|---|---|
| replace_all | 全置換 | available | 現在のデータを全て置き換える。現時点で実行可能。 |
| append_new | 追加 | preview_only | 既存データを残して新規データを追加する予定。実保存は未対応。 |
| update_by_external_id | external_idで更新 | preview_only | external_id一致データを更新し、存在しないものを追加する予定。実保存は未対応。 |
| skip_existing | 既存スキップ | preview_only | external_idが既に存在するものをスキップし、新規のみ追加する予定。実保存は未対応。 |
| add_as_new_ids | 別IDとして追加 | preview_only | external_idが重複しても別IDとして追加する予定。実保存は未対応。 |

### 28.1 実行可能条件

v0.9.0時点で、実際に取込実行できる条件は以下のみである。

```text
errorなし
importPolicy === replace_all
placeholderPersonPolicy === warn_and_skip
```

---

## 29. 仮人物作成方針

v0.9.0時点で、参照先不明・仮人物作成方針UIを実装済みである。

| 方針 | 表示名 | 状態 | 内容 |
|---|---|---|---|
| warn_and_skip | 警告して関係を作らない | available | 参照先不明を警告として表示し、該当関係は作成しない。現時点で実行可能。 |
| block_import | 取込を止める | preview_only | 参照先不明がある場合に取込不可とする方針。現時点ではプレビューのみ。 |
| create_placeholder_preview | 仮人物作成候補にする | preview_only | 参照先不明IDから仮人物を作る候補として表示する。実保存はしない。 |

---

## 30. JSONバックアップ

完全復元用形式としてJSONバックアップを実装する。

v0.9.0時点では、JSON backup `schema_version` は `1.4` である。Name / Place を含めるため、v0.9.0で `1.3` から `1.4` に更新した。

### 30.1 schema_version

| schema_version | 主な内容 |
|---|---|
| 1.0 | 初期バックアップ互換 |
| 1.1 | Source / Citation / Event等の拡張互換 |
| 1.2 | v0.7.0までのデータ、ImportBatch等 |
| 1.3 | Project / ViewSetting / ExportSetting / PrivacySettingを含む |
| 1.4 | Name / Placeを含む |

v0.9.0では、1.0 / 1.1 / 1.2 / 1.3 / 1.4 の復元互換を維持する。古いJSONにProject / settingsが存在しない場合はdefault project/settingsを補完し、names / places が存在しない場合は空配列として補完する。

### 30.2 v0.9.0時点で含める主な内容

- persons
- unions
- parent_child_relations
- events
- sources
- citations
- import_batches
- projects
- view_settings
- export_settings
- privacy_settings
- names
- places

### 30.3 v0.9.0時点で含めない内容

- ImportReport詳細
- 行単位インポートログ
- Media
- 公開用にマスクした別データ
- Projectごとのデータ分離情報

### 30.4 公開用出力モードとの関係

公開用出力モードは表示・出力時マスクであり、JSONバックアップの元データを勝手にマスクしない。公開用JSONバックアップは未対応である。

### 30.5 標準CSVセットとの違い

v0.9.0時点では、JSONバックアップではName / Placeを保存・復元できる。一方、標準CSVセットにはnames.csv / places.csvを追加していないため、標準CSVセット経由ではName / Place実体を入出力しない。

citations.csv の target_type=name/place は安全表示・検証対象だが、標準CSVセットでName / Place実体を復元する機能は将来対応である。

---

# 第6部：入力UI

## 31. 入力UI基本方針

入力UIは本アプリの最重要要件である。

### 31.1 基本思想

- 初心者は人物カードから直感的に入力できる。
- 慣れたユーザーは表形式で高速入力できる。
- 戸籍を読みながら入力できる。
- CSVで一括投入できる。
- 不明な情報は不明のまま登録できる。
- 後から出典や確度を補強できる。
- AI生成データを後から確認・修正できる。
- 取込前に警告・エラー・参照先不明を確認できる。
- 表示・出力・公開用設定はProject設定として保存できる。
- 別名・旧名・通称などのNameをPersonに紐づけて管理できる。
- 場所の正規化・再利用候補としてPlaceを管理できる。

### 31.2 v1.0.0時点の入力UI方針

v1.0.0では、既存の人物詳細、戸籍入力モード、CSVインポート、一覧・検索、Name / Place最小編集導線を安定化する。

最初期仕様書で想定していた表形式入力モード、Excel風セル編集、コピー＆ペースト、一括編集、一括置換は、v1.0.0では実装対象にしない。これらは大量入力の実用性を高める重要機能だが、UI・保存・検証・Undo/Redo・テストの影響範囲が大きいため、v1.1以降の独立フェーズで検討する。

---

## 32. CSVインポートUI

v0.9.0時点で、CSVインポートUIは以下を表示する。

- かんたんCSV読込
- 標準CSVセット読込
- 取込方式選択
- 参照先不明・仮人物作成方針選択
- インポート結果プレビュー
- 取込予定件数
- warning / error件数
- external_id照合結果
- 取込方式ごとの予定処理
- 参照先不明一覧
- 仮人物候補
- 標準CSVセット検証issue
- 取込実行ボタン
- 取込履歴
- インポート結果レポート

### 32.1 インポート結果プレビュー

表示する主な内容は以下。

- mode: simple_csv / standard_csv_set
- importPolicy
- importPolicyStatus
- placeholderPersonPolicy
- placeholderPersonPolicyStatus
- totalRows
- validRows
- warningRows
- errorRows
- totalIssues
- warningIssues
- errorIssues
- plannedCreate
- matchSummary
- policyPlan
- unresolvedReferenceSummary
- unresolvedReferences
- placeholderPersonCandidates

### 32.2 インポート結果レポート

取込成功後に直近レポートを表示する。

表示する主な内容は以下。

- 取込結果
- 取込元
- 取込方式
- 仮人物方針
- 実行日時
- ファイル名
- 取込件数
- warning / error
- external_id照合
- policyPlan
- 参照先不明
- 主なissue
- 主な参照先不明
- 仮人物候補
- 次に確認すること

---

## 33. 設定UI

v0.9.0時点で、Project / ViewSetting / ExportSetting / PrivacySetting の最小UIを提供する。

### 33.1 Project表示

- 現在のProject名を表示する。
- v0.9.0時点では単一default project相当であり、複数Project切替UIは未対応。

### 33.2 表示設定

- 表示密度
- 画面上の関係線凡例表示

### 33.3 出力設定

- 出力タイトル表示ON/OFF
- 出力タイトル
- 出力凡例表示
- 背景 white / transparent / soft

現行DOMキャプチャ方式では、画面凡例と出力凡例は連動扱いである。

### 33.4 公開用出力設定

- 公開用出力モードON/OFF
- 生存者日付マスク
- hidden / private 人物のマスク方針
- 本籍・備考等の表示用マスク方針

公開用出力モードは表示・出力時のみマスクし、元データは変更しない。

---

## 34. 戸籍入力モード

日本戸籍を読みながら入力するための専用UI。

v0.9.0時点で、戸籍入力モード最小版は実装済みである。

### 34.1 実装済みの主な機能

- Source選択
- Source簡易作成
- 新規人物追加
- 既存人物更新
- Person Citation自動作成
- 父・母・配偶者選択
- ParentChildRelation作成
- Union作成
- 出生・死亡Event作成
- 婚姻、離婚、養子縁組、認知、入籍、除籍、転籍、改名、居住、職業、称号等のEvent作成

### 34.2 将来強化

- 戸籍画像添付
- OCR支援
- AI読み取り支援
- 既存人物候補表示
- 同姓同名照合
- 戸籍単位の入力チェック

---

## 35. 人物詳細・関係編集UI

v0.9.0時点で、人物詳細パネルから以下が可能である。

- 人物基本情報編集
- Event追加・編集・削除
- Person Citation追加・編集・削除
- ParentChildRelation Citation追加・編集・削除
- Union Citation追加・編集・削除
- 親子関係削除
- Union削除
- 親子関係属性編集
- Union属性編集
- Name一覧表示
- Name追加・編集・削除

NameはPerson表示名の完全置換ではなく、別名・旧名・通称などの追加情報として扱う。Name編集でPerson本体を勝手に上書きしない。

相手人物の変更や高度な統合UIは将来対応とする。

### 35.1 Name / Place一覧・検索UI

v0.9.0時点で、左側パネルにName / Place一覧・検索の最小UIを実装済みである。

- Name一覧・検索・typeフィルタ
- Place一覧・検索・typeフィルタ
- 件数表示
- 0件表示
- Nameクリックによる関連Person移動
- Place追加・編集・削除フォーム

Place詳細専用画面は未対応である。Place削除時はEvent / Source本体を削除せず、Event.place_id / Source.place_idをクリアする。

---

# 第7部：家系図表示

## 36. 家系図表示方針

家系図本体はSVGで描画する。

家系図は単純なツリーではなく、PersonノードとUnionノードを持つ有向グラフとして扱う。

v0.9.0時点では、簡易独自レイアウトを採用する。ELK.js / React Flow / 複数ビュー本格対応は将来対応とする。

v1.0.0では、現行の基本家系図ビューを安定化する。最初期仕様書で想定していた横型家系図、直系祖先図、子孫図、扇形図、砂時計図、親族図、相続関係図風ビュー、旧家系図風縦書きビューはv1.1以降の候補とする。

---

## 37. 対応ビュー

v0.9.0時点では、基本の家系図ビューを実装済みである。

以下は将来本格対応とする。

- 縦型家系図
- 横型家系図
- 直系祖先図
- 子孫図
- 扇形図
- 砂時計図
- 親族図
- 相続関係図風
- 旧家系図風縦書き

---

## 38. 人物ノード表示

v0.9.0時点で、人物ノード表示密度を切り替えられる。表示密度はViewSettingとしてDB保存・復元される。

### 38.1 表示密度

| 表示密度 | 内容 |
|---|---|
| compact | 氏名中心の省スペース表示 |
| standard | 氏名・生没年・出典/確度の簡易ステータス |
| detailed | 氏名・生没年・称号・確度・確認状態・出典状態 |

### 38.2 生没年表示

例：

- `1900 - 1970`
- `1900 - `
- `? - 1970`

### 38.3 ノード強調

以下を見た目で分かるようにする。

- 出典なし
- 未確認
- 低確度
- 異説あり

### 38.4 公開用出力モードON時の表示

公開用出力モードON時は、設定に応じて人物ノードの表示をマスクする。

- hidden / private 人物は「非公開」表示にする。
- 生存者の日付は「生存中」等にする。
- 詳細表示でも、`rank_title` / `occupation` / `honseki_text` / `note` などを出しすぎない。
- 元Personデータは書き換えない。

---

## 39. 関係線表示

v0.9.0時点で、親子関係・Union関係の種別や状態を線で表現する。

### 39.1 親子線

| relation_type | 表示 |
|---|---|
| biological | 実線 |
| adoptive | 破線 |
| special_adoptive | 太めの破線 |
| step | 点線 |
| recognized | 破線 |
| foster | 細い点線 |
| unknown | 薄い線 |
| disputed | 警告色・目立つ破線 |

### 39.2 Union線

| 条件 | 表示 |
|---|---|
| union_type = marriage | 通常の婚姻線 |
| union_type = partner | 破線 |
| union_type = concubine | 点線系 |
| union_type = unknown / other | 薄い線 |
| status = divorced または end_reason = divorce | 離婚系の線 |
| status = widowed または end_reason = death | 死別系の線 |
| status = ended | 終了済みの線 |

### 39.3 confidence / review_status反映

以下を線に反映する。

- confidence = uncertain
- confidence = disputed
- review_status = unreviewed

### 39.4 関係線凡例

家系図ビューに最小限の凡例を表示する。

- 実親子 = 実線
- 養親子 = 破線
- 継親子 = 点線
- 婚姻 = 実線
- 離婚/終了 = 警告色・破線
- 異説あり = 警告色

v0.9.0時点では、ViewSetting.show_relation_legend と ExportSetting.show_legend の責務は分けているが、現行DOMキャプチャ方式のため画面凡例と出力凡例は連動扱いである。

---

# 第8部：出力機能

## 40. 出力機能の基本方針

v0.9.0時点で、以下の出力に対応する。

- CSV出力
- 標準CSVセット出力
- JSONバックアップ
- PNG出力
- PDF出力
- SVG出力最小版

家系図表示部分は `treeRef` 配下のDOMを出力対象とし、操作UIは `data-html2canvas-ignore="true"` で除外する。

公開用出力モードON時は、画面上の家系図ノードがマスク済み表示になるため、PNG / PDF / SVG にはマスク済み表示が反映される。

ただし、CSV出力、標準CSVセット出力、JSONバックアップは元データを勝手にマスクしない。公開用CSV / 公開用JSON / 公開用PDF専用レイアウトは未対応である。

---

## 41. 出力用見た目設定

v0.9.0時点で、出力用見た目設定はExportSettingとしてDB保存・復元される。

### 41.1 設定項目

| 項目 | 内容 |
|---|---|
| show_title | タイトル表示ON/OFF |
| title | 出力タイトル。空の場合は「家系図」扱い |
| show_legend | 出力に凡例を含めるかどうか |
| background | white / transparent / soft |

### 41.2 現時点の制限

- 本当の透過PNG生成は未対応。
- 用紙サイズ、ページ分割、余白詳細指定は未対応。
- 出典一覧付きPDFは未対応。
- 公開用PDF専用レイアウトは未対応。
- 画面凡例と出力凡例の完全分離は未対応。

---

## 42. PNG出力

v0.9.0時点で、表示中の家系図DOMをPNGとして出力する。

含まれるもの：

- 出力タイトル
- 家系図本体
- 凡例ON時の凡例
- 背景設定
- 公開用出力モードON時のマスク済み表示

除外するもの：

- 家系図操作ツールバー
- 出力用見た目設定UI
- 出力ボタン

---

## 43. PDF出力

v0.9.0時点で、html2canvas + jsPDF によりPDF出力する。

現時点では表示中の家系図DOMをPDF化する最小版である。

将来対応：

- 用紙サイズ指定
- ページ分割
- 余白詳細指定
- 出典一覧付きPDF
- 公開用PDF専用レイアウト
- 高品質PDFレンダラー

---

## 44. SVG出力

v0.9.0時点で、SVG出力最小版を実装済みである。

### 44.1 方式

- `treeRef.current` 配下のDOMをclone
- clone内の `[data-html2canvas-ignore="true"]` 要素を削除
- `foreignObject` を含むSVG文字列を生成
- BlobとObject URLで `.svg` ファイルとして保存

---

# 第9部：検証・検索・プライバシー

## 45. 検証機能

v0.9.0時点で、検証エンジンとValidationPanelを実装済みである。

### 45.1 検証対象

- persons
- unions
- parentChildRelations
- events
- sources
- citations

### 45.2 主な検証項目

- 出典なし
- 未確認
- 低確度
- 参照先不明
- 自己参照
- 日付矛盾
- 年齢警告
- Person死亡年が出生年より前
- 子の出生年が親の出生年より前
- 親が若すぎる/高齢すぎる
- 婚姻・離婚・終了日の矛盾
- 出生前Event / 死亡後Event
- name / place Citation参照切れ
- Event.place_id / Source.place_id参照切れ

### 45.3 ValidationPanel

- error / warning / info 件数表示
- severityフィルタ
- categoryフィルタ
- target_typeフィルタ
- 表示上限
- 検証結果から対象へ移動する導線
- person / event / union / relation issueから対象人物へ誘導
- source / citation issueは現時点では対象へ移動不可として安全表示

---

## 46. 検索・一覧機能

v0.9.0時点で、検索・一覧機能の最小版を実装済みである。

### 46.1 実装済み

- Person一覧
- Event一覧
- Source一覧
- Citation一覧
- Person検索・フィルタ
- Event検索・フィルタ
- Source / Citation検索・フィルタ
- Name / Place一覧・検索・typeフィルタ
- Citation対象名表示
- Sourceクリックによる関連Citation絞り込み
- Person / Event / Citation / ValidationPanelからの対象移動
- 件数表示・0件表示
- 左側パネル縦長化への最低限対応
- スマホ幅での一覧・検索UI最低限対応

### 46.2 未対応または将来対応

- Name詳細専用画面
- Place詳細専用画面
- Relation / Union専用一覧
- 本格ソート
- ページネーション
- 仮想スクロール
- 一括編集
- Source詳細画面
- Citation詳細画面
- Event詳細編集UIへの本格ジャンプ
- Name / Place一覧

---

## 47. プライバシー設計

家系情報は個人情報性が高いため、初期版はローカル保存を基本とする。

v0.9.0時点では、PrivacySettingと公開用出力モード最小版を実装済みである。

### 47.1 実装済み

- `public_output_mode`
- `hide_living_persons`
- `hide_private_persons`
- `hide_hidden_persons`
- `hide_honseki`
- `mask_living_dates`
- hidden / private 人物の表示用マスク
- 生存者日付の表示用マスク
- `rank_title` / `occupation` / `honseki_text` / `note` の表示用マスク
- PNG/PDF/SVGへのマスク済み表示反映

### 47.2 重要な制限

- 元Personデータは書き換えない。
- CSV出力、JSONバックアップ、標準CSVセット出力は元データのままである。
- 公開用CSV出力は未対応。
- 公開用JSONバックアップは未対応。
- 公開用PDF専用レイアウトは未対応。
- 生存者判定の高度化は未対応。
- 添付ファイル・戸籍画像のマスクは未対応。

---

# 第10部：画面一覧

## 48. 現在の主な画面構成

v0.9.0時点では、単一画面内に主要機能を集約している。

主な構成：

- ヘッダー
- CSV / JSON / PNG / PDF / SVG 出力導線
- CSVインポート・標準CSVセット導線
- 左側パネル
  - Project表示
  - 表示設定
  - 出力設定
  - 公開用出力設定
  - 取込・レイアウト状況
  - CSVインポートプレビュー
  - 取込方式選択
  - 参照先不明・仮人物方針選択
  - ImportBatch取込履歴
  - インポート結果レポート
  - 戸籍入力モード
  - データ検証結果
  - Person一覧
  - Event一覧
  - Source / Citation一覧
  - Name / Place一覧
- 中央家系図ビュー
- 人物詳細パネル

ValidationPanel、Person一覧、Event一覧、Citation一覧からは、共通選択・ジャンプ基盤を通じて対象人物または関連人物へ移動できる。Source / Citation issueからの専用詳細ジャンプは将来対応とする。

---

## 49. 家系図画面

機能：

- 家系図表示
- 拡大縮小
- 全体表示
- リセット
- ドラッグ移動
- 表示密度切替
- 人物クリックで詳細表示
- 関係線凡例
- 出力用見た目設定
- 公開用出力モード
- PNG/PDF/SVG出力
- 出力時の操作UI除外

---

## 50. 将来画面

将来的に以下の画面を分離または追加する。

- ホーム画面
- プロジェクト画面
- 人物一覧専用画面
- Name一覧専用画面
- Place一覧専用画面
- Source一覧専用画面
- Event一覧専用画面
- Citation一覧専用画面
- CSVインポート専用画面
- ImportBatch詳細画面
- 戸籍資料画面
- 矛盾チェック画面
- 設定画面
- プライバシー設定画面

---

# 第11部：日付・和暦仕様

## 51. 日付管理方針

日付は以下を分けて管理する。

- 表示用日付
- 検索用開始日
- 検索用終了日
- 精度

v0.9.0時点では、表示用日付テキストと4桁西暦抽出を中心に扱う。最初期仕様書で想定していた和暦・西暦変換、和暦期間解析、江戸以前の暦対応などの本格日付解析は、v1.0.0では新規実装せず、v1.1以降の候補とする。

v0.9.0時点では、検証用途として4桁西暦抽出の最小対応を実装済みである。

対応例：

- `1900`
- `1900年`
- `1900-01-01`
- `1900/01/01`
- `西暦1900年`
- `約1900年`
- `1900頃`
- `1900年頃`
- `c.1900`
- `ca.1900`

和暦の本格解析は将来対応とする。

---

## 52. 和暦対応

将来的に最低限対応する元号：

- 明治
- 大正
- 昭和
- 平成
- 令和

江戸以前の元号対応はさらに将来課題とする。

---

# 第12部：GEDCOM・親等・相続

## 53. GEDCOM対応

v0.8.0時点ではGEDCOM対応は未実装。

ただし、データ構造はGEDCOMに変換しやすいよう、Person / Union / Event / Source / Citation を分離している。

将来対応：

- GEDCOM 5.5.1エクスポート
- GEDCOM 7エクスポート
- GEDCOMインポート
- メディア付きZIP出力

---

## 54. 親等計算・相続関係

v0.8.0時点では未対応。

将来的に以下を実装する。

- 親等計算
- 直系尊属
- 直系卑属
- 傍系血族
- 姻族
- 法定相続人候補表示
- 相続関係説明図出力

---

# 第13部：実装構成

## 55. 推奨ディレクトリ構成

```text
/kakeizu-studio/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ public/
│  ├─ manifest.json
│  └─ icons/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ db/
│  ├─ models/
│  ├─ services/
│  │  ├─ csvImportService.ts
│  │  ├─ csvExportService.ts
│  │  ├─ standardCsvSetService.ts
│  │  ├─ importPreviewService.ts
│  │  ├─ importBatchService.ts
│  │  ├─ importReportService.ts
│  │  ├─ projectSettingsService.ts
│  │  ├─ privacyDisplayService.ts
│  │  ├─ validationService.ts
│  │  ├─ layoutService.ts
│  │  ├─ exportImageService.ts
│  │  └─ backupService.ts
│  ├─ components/
│  │  ├─ FamilyTreeView/
│  │  ├─ PersonDetailPanel/
│  │  ├─ ValidationPanel/
│  │  ├─ KosekiEntryPanel/
│  │  ├─ PersonListPanel/
│  │  ├─ EventListPanel/
│  │  └─ SourceCitationPanel/
│  ├─ styles/
│  └─ tests/
└─ README.md
```

---

## 56. 主要サービス

### 56.1 csvImportService / csvExportService

- かんたんCSV読み込み
- 列マッピング
- 正規化
- かんたんCSV出力
- 標準CSVセットとの連携

### 56.2 standardCsvSetService

- 標準CSVセット入出力
- ZIP / 複数CSV読込
- manifest検証
- 必須ファイル検証
- 必須列検証
- 重複ID検証
- 参照整合検証
- 列挙値検証

### 56.3 importPreviewService

- ImportPreviewResult生成
- ImportPolicy
- PlaceholderPersonPolicy
- external_id照合
- policyPlan生成
- 参照先不明検出
- 仮人物候補生成
- 取込可否判定

### 56.4 importBatchService

- ImportBatch最小版作成
- 保存対象判定
- 直近履歴ソート

### 56.5 importReportService

- ImportReport生成
- nextActions生成
- issue / unresolved reference / placeholder候補プレビュー生成

### 56.6 projectSettingsService

- default Project作成
- default ViewSetting作成
- default ExportSetting作成
- default PrivacySetting作成
- Project / settings読み込み
- 設定保存

### 56.7 privacyDisplayService

- 公開用出力モードOFF時の既存表示維持
- hidden / private人物の表示用マスク
- 生存者日付の表示用マスク
- `rank_title` / `occupation` / `honseki_text` / `note` の表示用マスク
- 元Person非破壊の表示用データ生成

### 56.8 backupService

- JSONバックアップ作成
- JSON復元
- schema_version確認
- Project / settingsのバックアップ・復元
- 旧JSON復元時のdefault settings補完

### 56.9 validationService

- 出典なし
- 未確認
- 低確度
- 参照切れ
- 自己参照
- 日付矛盾
- 年齢警告

### 56.10 layoutService

- DBデータから描画用ノード・エッジ生成
- Unionノード生成
- 簡易レイアウト計算
- 関係線用メタデータ付与

### 56.11 exportImageService

- PNG出力
- PDF出力
- SVG出力最小版
- SVG文字列生成
- 操作UI除外

---

# 第14部：テスト仕様

## 57. テスト方針

UIテストより先に、データ変換・正規化・検証・出力文字列生成をテストで固める。

v0.9.0時点で、Vitestにより主要機能のテストが整備されている。

---

## 58. 必須テスト

### 58.1 CSV / JSON

- かんたんCSVインポート
- 標準CSVセット入出力
- 標準CSVセット検証
- JSONバックアップ
- JSON復元
- schema_version 1.4
- 1.3以前のJSON復元互換
- Source / Citation / Eventの保持
- Project / settingsの保持
- Name / Placeの保持

### 58.2 インポートプレビュー

- ImportPreviewSummary
- ImportPolicy
- PlaceholderPersonPolicy
- canImport判定
- external_id照合
- policyPlan
- unresolvedReferences
- placeholderPersonCandidates
- 標準CSVセットのwarningRows / errorRows集計

### 58.3 ImportBatch / ImportReport

- ImportBatch作成
- completed / completed_with_warnings
- preview_only除外
- recentImportBatches
- ImportReport生成
- nextActions生成
- issuePreview件数制限

### 58.4 Project / settings

- default Project作成
- default ViewSetting作成
- default ExportSetting作成
- default PrivacySetting作成
- 設定読み込み
- 設定保存
- 旧JSON復元時のdefault settings補完

### 58.5 PrivacySetting / 公開用出力

- public_output_mode OFFでは既存表示を維持する。
- hidden人物を「非公開」表示にできる。
- private人物を設定に応じてマスクできる。
- living人物の日付をマスクできる。
- `rank_title` / `occupation` / `honseki_text` / `note` を表示用データから除外できる。
- 元Personオブジェクトを変更しない。

### 58.6 データ検証

- name/place Citation参照切れ
- Event.place_id / Source.place_id参照切れ
- 出典なし
- 未確認
- 低確度
- 参照切れ
- 自己参照
- 日付矛盾
- 年齢警告

### 58.7 家系図表示

- layoutNodes / layoutEdges生成
- Unionノード方式
- 表示密度切替
- 人物ノード表示
- 関係線クラス
- 凡例表示
- 公開用出力モードON時のマスク表示

### 58.8 出力

- PNG/PDF/SVGボタン表示
- 出力タイトルON/OFF
- 凡例ON/OFF
- 背景切替
- 操作UI除外
- SVG文字列生成
- SVG内のタイトル・人物名・凡例・背景

### 58.9 検索・一覧・選択導線

- selectionService
- personListFilter
- PersonListPanel
- eventListFilter
- EventListPanel
- sourceCitationFilter
- SourceCitationPanel
- ValidationPanelの対象移動
- Source / Citation issueの移動不可表示
- Person / Event / Citationクリックからの共通選択基盤接続

---

# 第15部：受け入れ基準

## 59. v0.9.0時点の到達条件

v0.9.0時点で、以下を満たす。

1. CSVから人物・親子・配偶者を一括登録できる。
2. Person / Union / ParentChildRelationを管理できる。
3. Source / Citation を管理できる。
4. Eventを管理できる。
5. 戸籍入力モード最小版が使える。
6. 関係単位Citationを付与できる。
7. 親子関係・Unionを編集・削除できる。
8. ValidationPanelで検証結果を確認できる。
9. 家系図がSVGで自動表示される。
10. Unionノード方式で子を表示できる。
11. 表示密度を切り替えられる。
12. 人物ノードに生没年・出典・確度・確認状態を表示できる。
13. 関係線の種類を視覚的に区別できる。
14. PNG出力できる。
15. PDF出力できる。
16. SVG出力最小版が使える。
17. CSV/JSONでバックアップできる。
18. 共通選択・ジャンプ基盤がある。
19. Person一覧で検索・フィルタできる。
20. Event一覧で検索・フィルタできる。
21. Source / Citation一覧で検索・フィルタできる。
22. ValidationPanelからperson / event / union / relation対象へ移動できる。
23. CSVインポート前にプレビューできる。
24. 取込方式を選択できる。
25. external_id照合結果を確認できる。
26. 参照先不明と仮人物候補を確認できる。
27. 標準CSVセット検証が強化されている。
28. ImportBatch最小版が使える。
29. インポート結果レポートを確認できる。
30. Projectモデル最小版がある。
31. default projectが作成・読み込みされる。
32. ViewSettingが保存・復元される。
33. ExportSettingが保存・復元される。
34. PrivacySettingが保存・復元される。
35. 公開用出力モードON/OFFを切り替えられる。
36. 公開用出力モードOFFでは既存表示を維持する。
37. 公開用出力モードONでは最低限の人物表示マスクが機能する。
38. 元Personデータは書き換えられない。
39. JSON backup schema_version 1.4でProject / settings / Name / Placeを保存できる。
40. JSON 1.3以前の復元互換を維持する。
41. Dexie schema version(5)でProject / settingsテーブルとnames / placesテーブルを持つ。
42. Nameモデル最小版がある。
43. Person詳細でNameを追加・編集・削除できる。
44. Placeモデル最小版がある。
45. Placeを追加・編集・削除できる。
46. Event / SourceからPlaceを任意参照できる。
47. Event.place_text / Source.honseki_text / Source.repositoryを維持している。
48. Citation target_type=name/placeを安全表示・検証対象にできる。
49. 標準CSVセット構造を変更していない。
50. names.csv / places.csvを標準CSVセットに追加していない。
51. Vitestで主要機能のテストが通る。

---

## 60. v1.0.0 安定版の目標

v1.0.0では、以下を安定版の基準とする。

- 戸籍・出典管理対応の基本機能が安定している。
- 検索・一覧・修正導線がある。
- CSVインポートが実用的に使える。
- Project / ViewSetting / ExportSetting / PrivacySetting の最小版がある。
- Name / Place の最小版がある。
- JSONバックアップ・復元が安定している。
- 出力機能が親族共有に耐える品質である。
- 主要未対応事項がREADMEと仕様書に整理されている。

### 60.1 v1.0.0で新規実装しないもの

v1.0.0は安定版仕上げであり、以下は安定版の必須条件に含めない。

- 表形式入力モード
- Excel風セル編集
- 一括編集 / 一括置換
- 複数ビュー本格対応
- 横型家系図 / 直系祖先図 / 子孫図などの専用ビュー
- Media管理
- 添付ファイル / 戸籍画像管理
- 和暦本格解析
- 標準CSVセットへの names.csv / places.csv / media.csv 追加
- Source / Citation / Name / Place詳細専用画面
- Source編集UIでのPlace選択
- Citation編集UIでのname/place本格選択
- GEDCOM対応
- 親等計算
- 相続関係説明図
- OCR / AIによる戸籍読み取り支援

これらは、v1.0.0リリース後に使用感と優先度を見て、v1.1以降の個別フェーズとして扱う。

---

# 第16部：AIコーディング向け実装プロンプト戦略

## 61. 基本方針

AIコーディングツールには、本仕様書全体を一括で「作って」と指示しない。必ず小さな単位に分割する。

v0.9.0までの開発では、この分割方針が有効だった。今後も同じ方針を維持する。

---

## 62. 今後の推奨プロンプト順

v0.9.0までの開発では、小さなフェーズに分割して、各段階でテストとビルドを通す進め方が有効だった。今後も同じ方針を維持する。

### v0.9.0：Name / Place 最小版

v0.9.0は完了済みである。次はv1.0.0安定版仕上げに進む。

### v1.0.0：安定版仕上げ

- v1.0 第1フェーズ：v0.1〜v0.9到達点棚卸し
- v1.0 第2フェーズ：サンプルデータ整備
- v1.0 第3フェーズ：README / RELEASE_NOTES / 仕様書整理
- v1.0 第4フェーズ：バックアップ互換性確認
- v1.0 第5フェーズ：主要導線の手動確認リスト整備
- v1.0 第6フェーズ：テスト整理
- v1.0 第7フェーズ：GitHub Pages公開確認
- v1.0 第8フェーズ：既知の未対応事項整理
- v1.0 第9フェーズ：v1.0全体仕上げ確認
- v1.0 第10フェーズ：v1.0.0リリース固定

### v1.1以降：拡張フェーズ候補

v1.0.0リリース後は、以下を個別フェーズとして検討する。

- 表形式入力 / 一括編集
- Source / Citation / Name / Place詳細画面
- 標準CSVセットへの names.csv / places.csv 追加
- Media / 添付ファイル管理
- 和暦本格解析
- 複数ビュー本格対応
- GEDCOM対応
- 親等計算 / 相続関係説明図
- OCR / AI戸籍読み取り支援

---

# 第17部：最終まとめ

## 63. 本アプリの中核価値

本アプリの中核価値は以下である。

```text
CSVで家系データを一括投入できる
↓
人物・親子・婚姻関係を正規化できる
↓
戸籍資料・出典・Event・関係根拠を管理できる
↓
検証機能で未確認・出典なし・矛盾を確認できる
↓
検索・一覧から対象データを探せる
↓
検証結果から修正対象へ移動できる
↓
取込前に警告・エラー・参照先不明・external_id一致を確認できる
↓
ImportBatchとImportReportで取込結果を確認できる
↓
表示設定・出力設定・公開用出力設定を保存できる
↓
Unionノード方式で複雑な家系を表現できる
↓
SVGで見やすく表示できる
↓
表示密度・関係線凡例で意味が分かる
↓
公開用出力モードで最低限のマスクができる
↓
手修正できる
↓
PDF / PNG / SVG / CSV / JSONで出力できる
↓
将来的にName / Place本格管理・GEDCOM・親等計算・相続関係説明図へ拡張できる
```

---

## 64. 最重要設計判断

本仕様書における最重要判断は以下である。

1. 家系図をツリーではなく、Person + Unionの有向グラフとして扱う。
2. 内部IDとCSV用外部IDを分離する。
3. CSVサンプルファーストで開発する。
4. SVGを描画・出力の主軸にする。
5. 出典を事実単位に紐づける。
6. AI生成データを最初から確定扱いしない。
7. ローカルファーストで個人情報を安全に扱う。
8. Projectは段階導入とし、v0.8.0時点では設定管理の器に留める。
9. 公開用出力モードは表示・出力時マスクとし、元データを勝手に破壊しない。
10. Name / Placeはv0.9.0で最小版として段階導入済みであり、既存フィールドを置き換えず横付け追加モデルとして扱う。

この方針を崩さないことが、開発成功の条件である。

---

## 65. 現在の完成イメージ

v0.9.0時点では、ユーザーが以下を実行できる状態である。

1. ChatGPTやExcelで家系データCSVを作る。
2. そのCSVを本アプリに読み込む。
3. 取込前にプレビュー、警告、エラー、参照先不明、external_id一致を確認する。
4. 実行可能条件を満たすCSVを取り込む。
5. アプリが人物・親子・配偶者関係を自動生成する。
6. 取込履歴とインポート結果レポートを確認する。
7. 戸籍入力モードでSource / Citation / Eventを追加する。
8. 関係根拠を人物・親子関係・Unionに紐づける。
9. ValidationPanelで未確認・出典なし・矛盾を確認する。
10. Person一覧・Event一覧・Source / Citation一覧から登録済みデータを探す。
11. 検索・フィルタで修正対象を絞り込む。
12. 検証結果や一覧から人物詳細へ移動する。
13. 家系図をSVGで表示する。
14. 表示密度や関係線凡例で見やすく確認する。
15. 出力タイトル・凡例・背景を調整し、設定を保存する。
16. 公開用出力モードで最低限の人物表示マスクをかける。
17. 家系図をPNG/PDF/SVGで出力する。
18. Personに別名・旧名・通称などのNameを追加する。
19. Placeを追加・編集・削除し、Event / Sourceから任意参照する。
20. Name / Placeを一覧・検索する。
21. データをCSV/JSONで保存する。

---

## 66. 将来の完成形

将来的には、本アプリを以下の方向へ拡張する。

- 表形式入力 / 一括編集
- Name / Place / Media本格管理
- Source / Citation / Name / Place詳細画面
- 標準CSVセットへの names.csv / places.csv / media.csv 追加
- 和暦本格解析
- 複数ビュー本格対応
- 完全な複数Project切替
- Person等への project_id 付与
- Projectごとのデータ分離
- Source / Citation詳細画面
- Event詳細編集UIへの本格ジャンプ
- 公開用CSV / JSON / PDF
- 添付ファイル・戸籍画像のマスク
- GEDCOM対応
- 親等計算
- 相続関係説明図
- AIによる戸籍読み取り支援
- OCR
- クラウド同期
- 共同編集

ただし、最初から全部を実装しない。今後も、小さなフェーズに分けて、テストとビルドが通る状態を維持しながら拡張する。

---

## 67. 結論

Kakeizu Studio は、海外系譜ソフトの堅牢なデータ構造、日本向け家系図アプリの分かりやすい入力UI、AI時代のCSV一括生成ワークフローを統合した、戸籍ベース家系図作成アプリである。

v0.9.0時点で、CSVから家系図を作るMVP、戸籍・出典・Event管理、関係根拠、検証機能、家系図表示・出力強化、検索・一覧・検証結果からの修正導線、CSVインポートの取込前確認・履歴・結果レポート、Project/settingsの最小永続化、公開用出力モード最小版、Name / Place最小版まで到達している。

今後は、v1.0.0安定版仕上げへ進むことで、単なる家系図作図アプリではなく、戸籍調査と出典管理に耐える家系データ管理アプリへ育てていく。

v1.0.0では新機能を増やすより、現行機能の説明、サンプル、確認手順、バックアップ互換性、テスト、既知の未対応事項を固める。表形式入力、複数ビュー、Media管理、和暦本格解析、標準CSVセット拡張、GEDCOM、親等計算などはv1.1以降で段階的に検討する。
