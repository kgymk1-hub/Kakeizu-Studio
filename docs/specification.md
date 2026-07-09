# 戸籍・出典管理対応 家系図作成アプリ 詳細仕様書

Version 1.2

v0.6.0 実装反映版

---

## 改訂履歴

| 版 | 内容 |
|---|---|
| Version 1.0 | 初期詳細仕様。戸籍・出典管理対応の家系図作成アプリとして、基本方針、データモデル、CSV、入力UI、家系図表示、出力、検証、実装構成を定義。 |
| Version 1.1 | Kakeizu Studio v0.5.0 までの実装状況を反映。戸籍入力、Event、Source/Citation、関係根拠、検証機能、家系図表示強化、関係線表示強化、出力用見た目設定、PNG/PDF/SVG出力を反映。今後のロードマップを v0.6.0 以降に整理。 |
| Version 1.2 | Kakeizu Studio v0.6.0 までの実装状況を反映。検索・一覧・検証結果からの修正導線として、選択・ジャンプ基盤、Person一覧、Event一覧、Source/Citation一覧、ValidationPanelからの対象移動、一覧・検索UI仕上げを反映。今後のロードマップを v0.7.0 以降に整理。 |

---

## 0. 本仕様書の位置づけ

本仕様書は、日本の戸籍調査に適した家系図作成アプリ **Kakeizu Studio** を開発するための詳細仕様書である。

本アプリは、単に人物を線でつなぐ「家系図作図アプリ」ではない。人物、婚姻・パートナー関係、親子関係、出来事、出典、戸籍資料、確度、確認状態、異説を管理し、そのデータから家系図を自動生成する **家系データ管理アプリ** として設計する。

Version 1.2 では、Version 1.1 の基本設計を維持しつつ、Kakeizu Studio v0.6.0 までの実装状況を反映する。

v0.6.0 時点では、以下が実装済みまたは最小版実装済みである。

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
- 出力用見た目設定
- CSV / 標準CSVセット / JSON / PNG / PDF / SVG 出力
- 共通選択・ジャンプ基盤
- Person一覧・検索
- Event一覧・検索
- Source / Citation一覧・検索
- Citation対象名表示
- Sourceクリックによる関連Citation絞り込み
- ValidationPanelからの対象移動
- 一覧・検索UI仕上げ
- 左側パネル縦長化への最低限対応
- スマホ幅での一覧・検索UI最低限対応

一方、以下は将来対応または本格対応前の段階である。

- CSVインポート本格化
- Project / ViewSetting / ExportSetting のDB永続化
- PrivacySetting / 公開用出力モード
- Name / Place / Media の本格管理
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
- 生存者マスク
- OCR / AIによる戸籍読み取り支援
- ELK.js / React Flow / 複数ビュー本格対応
# 第1部：基本方針

---

## 1. アプリ名

正式名称は **Kakeizu Studio** とする。

日本語では「戸籍・出典管理対応 家系図作成アプリ」と説明する。

本アプリは、家系図をきれいに描くことだけでなく、戸籍・出典・確度・異説を管理し、調査データとして育てられることを重視する。

---

## 2. 開発目的

本アプリの目的は、以下の流れを実現することである。

```text
CSV一括投入
↓
人物・親子・婚姻データの正規化
↓
戸籍資料・出典・Event・関係根拠の登録
↓
検証機能による矛盾・未確認・出典なし確認
↓
家系図自動生成
↓
画面上で手修正
↓
PNG / PDF / SVG / CSV / JSON 出力
↓
将来的に検索・一覧・修正導線、GEDCOM、親等計算、AI/OCRへ拡張
```

特に、次のユースケースを重視する。

1. 自分の家系を戸籍・除籍・改製原戸籍から整理する。
2. ExcelやCSVで整理した家系データを取り込む。
3. ChatGPT等で調査・整理した歴史上人物の家系をCSV化し、一括インポートする。
4. 天皇家、武家、旧家、有名一族などの公開情報を家系図として可視化する。
5. 親族に見せるためのPDF・PNG・SVG家系図を作成する。
6. 調査根拠や出典を後から追加して、信頼性の高い家系データベースに育てる。
7. AI生成データを未確認データとして取り込み、後から検証・修正する。

---

## 3. 基本コンセプト

本アプリの基本思想は、**「家系図を直接描く」のではなく、「家系データを管理し、そこから家系図を生成する」**ことである。

したがって、内部データは単純なツリー構造ではなく、人物・関係・出来事・出典を分離したグラフ構造で保持する。

### 3.1 本アプリで扱う主要概念

| 概念 | v0.6.0時点の扱い |
|---|---|
| Project | 将来本格対応。現時点では単一プロジェクト相当。 |
| Person | 実装済み。人物基本情報・人物詳細・人物一覧・検索を管理。 |
| Name | 将来対応。 |
| Union | 実装済み。婚姻・パートナー関係・不明な親組み合わせを管理。専用一覧は将来対応。 |
| ParentChildRelation | 実装済み。親子関係を人物から分離して管理。専用一覧は将来対応。 |
| Event | 実装済み。出生・死亡・婚姻・離婚・養子縁組・転籍等を管理し、Event一覧・検索を提供。 |
| Source | 実装済み。戸籍・Web・書籍・AI生成データ等の資料を管理し、Source一覧・検索を提供。 |
| Citation | 実装済み。人物・Event・Union・Relationへの根拠付けを管理し、Citation一覧・対象名表示・検索を提供。 |
| Media | 将来対応。 |
| Place | 将来対応。 |
| ImportBatch | 一部設計済み。v0.7.0で最小版を検討。 |
| ViewSetting | 将来対応。現時点では画面状態で最小管理。 |
| ExportSetting | 将来対応。現時点では画面状態で出力用見た目設定を最小管理。 |

### 3.2 重要な設計思想

- 人物と親子関係を分ける。
- 人物と婚姻・配偶者関係を分ける。
- 親子関係には種別を持たせる。
- 婚姻・パートナー関係はUnionとして独立させる。
- 出典は人物単位ではなく、事実単位に紐づける。
- CSV上のIDとアプリ内部IDを分離する。
- 家系図はツリーではなく、PersonノードとUnionノードを持つ有向グラフとして扱う。
- AI生成データは最初から確定扱いしない。
- 表示用データと保存用データを分離する。
- 編集用ビューと出力用ビューを分離する。
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

---

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
| テスト | Vitest | 採用 |
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

v0.6.0時点で、SVG出力は最小版として実装済みである。

現行方式は、表示中の家系図DOMをcloneし、`data-html2canvas-ignore="true"` が付いた操作UIを除外したうえで、`foreignObject` を含むSVG文字列として保存する方式である。

### 7.1 SVG出力に含めるもの

- 出力タイトル
- 家系図本体
- 関係線凡例
- 背景設定

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
- 将来的には、専用SVGレンダラーやstyle埋め込み強化を検討する。

---

# 第3部：開発フェーズと現在到達点

---

## 8. 実装済みロードマップ

v0.6.0時点の実装済みロードマップは以下である。

| バージョン | 内容 | 状態 |
|---|---|---|
| v0.1.0 | CSVから家系図を作るMVP | 完了 |
| v0.2.0 | 戸籍入力・Event・出典管理 | 完了 |
| v0.3.0 | 関係根拠・関係編集削除 | 完了 |
| v0.4.0 | データ検証・日付年齢チェック | 完了 |
| v0.5.0 | 家系図表示・出力の見栄え強化 | 完了 |
| v0.6.0 | 検索・一覧・検証結果からの修正導線 | 完了 |

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
- 対応例：`1900`, `1900年`, `1900-01-01`, `1900/01/01`, `西暦1900年`, `約1900年`, `1900頃`, `1900年頃`, `c.1900`, `ca.1900`

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
  - タイトル表示ON/OFF
  - タイトル入力
  - 凡例表示ON/OFF
  - 背景 white / transparent風 / soft
- PNG/PDF出力時の操作UI除外
- SVG出力最小版

### 8.6 v0.6.0 実装済み内容

v0.6.0では、「検索・一覧・検証結果からの修正導線」を実装した。

- 共通選択・ジャンプ基盤
  - `SelectableTargetType`
  - `SelectableTarget`
  - `resolveSelectableTargetToPersonId`
  - `validationIssueToSelectableTarget`
  - App側の `selectTarget`
  - person / event / union / relation から人物詳細への誘導
  - source / citation は現時点では安全に扱う
- Person一覧・検索
  - `PersonListPanel`
  - 氏名・かな・旧姓・称号・職業・備考の検索
  - gender / confidence / review_status / 出典ありなしフィルタ
  - Personクリックで人物詳細へ移動
  - 件数表示・0件表示
- Event一覧
  - `EventListPanel`
  - event_typeフィルタ
  - 日付・説明・備考・関連人物名検索
  - 関連人物名表示
  - Eventクリックで対象へ移動
  - 件数表示・0件表示
- Source / Citation一覧
  - `SourceCitationPanel`
  - Source一覧
  - Citation一覧
  - source_typeフィルタ
  - Citation target_typeフィルタ
  - Source / Citation検索
  - Citation対象名表示
  - Citationクリックで対象へ移動
  - Sourceクリックで関連Citation絞り込み
  - 件数表示・0件表示
- ValidationPanel修正導線
  - ValidationPanelのissueから対象へ移動
  - `onSelectTarget` prop
  - person / event / union / relation issueから対象人物へ誘導
  - source / citation issueは現時点では対象へ移動不可として安全表示
  - 既存のseverity / category / target_typeフィルタ維持
- 一覧・検索UI仕上げ
  - 共通list系CSS
  - 検索欄・フィルタ・件数表示・0件表示の整理
  - 左側パネル縦長化対応
  - スマホ表示最低限対応

v0.6.0では、package versionは `0.6.0` に更新された。ただし、JSON backup `schema_version` とDexie schema versionは変更していない。
## 9. 今後のロードマップ

v0.6.0までで、基本的な家系データ管理、家系図表示・出力、検索・一覧・修正導線の最小版まで到達した。今後は、CSVインポートの実用性強化、設定の永続化、Name / Place、安定版仕上げへ進む。

| バージョン | 内容 |
|---|---|
| v0.7.0 | CSVインポート本格化 |
| v0.8.0 | Project / 表示設定 / 出力設定 / プライバシー設定 |
| v0.9.0 | Name / Place 最小版 |
| v1.0.0 | 戸籍・出典管理対応の安定版 |
| v1.1以降 | GEDCOM、親等計算、相続関係説明図、OCR/AI支援、複数ビュー本格対応 |

### 9.1 v0.7.0 の目標：CSVインポート本格化

v0.7.0では、CSVインポートを実用運用に耐える形へ強化する。

主な対象は以下である。

- CSVインポート現状棚卸し
- かんたんCSV / 標準CSVセットの検証強化
- インポート結果プレビュー強化
- 正常行 / 警告行 / エラー行の表示
- 新規 / 更新 / スキップ / 別ID追加候補の表示
- 既存external_id照合
- 取込方式選択
- 全置換 / 追加 / 更新 / スキップ / 別ID追加
- 参照先不明の扱い
- 仮人物作成方針
- 標準CSVセットの相互参照チェック
- ImportBatch最小版
- インポート結果レポート

### 9.2 v0.8.0 の目標：Project / 表示設定 / 出力設定 / プライバシー設定

v0.8.0では、単一画面状態で管理している設定を、DBに永続化できる最小モデルへ進める。

主な対象は以下である。

- Projectモデル
- ViewSettingモデル
- ExportSettingモデル
- PrivacySetting相当
- 出力設定のDB永続化
- 公開用出力モードの準備
- 生存者・非公開情報の扱いの整理

### 9.3 v0.9.0 の目標：Name / Place 最小版

v0.9.0では、PersonやEventに埋め込まれている名前・場所情報を、必要に応じて独立管理できる最小版へ進める。

主な対象は以下である。

- Nameモデル
- Placeモデル
- CSV / JSON対応
- Person / Eventとの連携
- Citation対象としてのname / placeの本格化準備

### 9.4 v1.0.0 の目標：安定版仕上げ

v1.0.0では、戸籍・出典管理対応の安定版として、v0.1.0〜v0.9.0の全体整合を整える。

主な対象は以下である。

- README / RELEASE_NOTES整理
- テスト整理
- サンプルデータ整備
- GitHub Pages公開確認
- バックアップ互換性確認
- 主要導線の手動確認
- v1.0.0リリース固定
# 第4部：データモデル

---

## 10. ID設計

本アプリでは、すべての主要データに内部IDと外部IDを分けて持たせる。

| ID | 用途 |
|---|---|
| id | アプリ内部の主キー。UUIDまたはnanoid相当。 |
| external_id | CSVや人間向けのID。P001、TENNO_001など。 |
| import_batch_id | どのインポート由来かを示すID。 |

CSVで指定される `P001` のようなIDを内部主キーにすると、複数CSV取り込み時やプロジェクト統合時に衝突するため、内部IDはアプリが自動生成する。

---

## 11. Person

人物情報を管理する。

| 項目 | 必須 | 内容 |
|---|---|---|
| id | 必須 | 内部ID |
| external_id | 任意 | CSV等の外部ID |
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

v0.6.0時点では、Eventは `target_type` と `target_id` を持ち、person / union / relation を対象にできる設計で実装されている。Event一覧から対象へ移動する最小導線も実装済みである。

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

例：

- P001の生年月日 → S001の3行目
- P001とP002の婚姻関係 → S002
- P003がP001の子であること → S003

---

## 17. 将来モデル

以下は将来の本格対応対象である。

### 17.1 Name

別名、旧名、戒名、幼名、通称、諱などを管理する。

### 17.2 Place

本籍地、出生地、死亡地、居住地、埋葬地などを管理する。

### 17.3 Media

写真、戸籍画像、PDF、スキャン画像を管理する。

### 17.4 Project / ViewSetting / ExportSetting

v0.6.0時点では本格永続化していない。将来、プロジェクト単位の設定、表示設定、出力設定、プライバシー設定をDBに保存する。

---

# 第5部：CSV / JSON / バックアップ仕様

---

## 18. CSV機能の目的

CSVインポート/エクスポートは本アプリの中核機能である。

目的は以下。

- ChatGPT等で作成した家系データを取り込む。
- Excelで整理したデータを取り込む。
- 既存データを外部編集して戻す。
- 大量の人物を一括登録する。
- 歴史人物や天皇家などの公開情報を家系図化する。
- データを人間が読みやすい形でバックアップする。

---

## 19. 対応CSV形式

本アプリは2種類のCSV形式に対応する。

1. かんたんCSV
2. 標準CSVセット

v0.6.0時点では、基本的なCSVインポート、標準CSVセット入出力、複数CSV直接インポートが実装済みである。v0.7.0でCSVインポート本格化を予定する。

---

## 20. かんたんCSV

1ファイルだけで取り込める初心者向け形式。

### 20.1 最小列

```text
person_id,name
```

### 20.2 推奨列

```text
person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
```

---

## 21. 標準CSVセット

複数CSVをZIPにまとめて取り込む本格形式。

### 21.1 ZIP構成

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

将来的には以下を追加する。

- names.csv
- media.csv
- places.csv
- view_settings.csv
- export_settings.csv

---

## 22. JSONバックアップ

完全復元用形式としてJSONバックアップを実装する。

v0.6.0時点では、JSON backup `schema_version` は `1.2` のままである。v0.6.0の検索・一覧・修正導線はDBスキーマやバックアップスキーマの破壊的変更を伴わない。

### 22.1 現時点で含める主な内容

- persons
- unions
- parent_child_relations
- events
- sources
- citations

### 22.2 将来含める内容

- project
- names
- media
- places
- view_settings
- export_settings
- import_batches

---

# 第6部：入力UI

---

## 23. 入力UI基本方針

入力UIは本アプリの最重要要件である。

### 23.1 基本思想

- 初心者は人物カードから直感的に入力できる。
- 慣れたユーザーは表形式で高速入力できる。
- 戸籍を読みながら入力できる。
- CSVで一括投入できる。
- 不明な情報は不明のまま登録できる。
- 後から出典や確度を補強できる。
- AI生成データを後から確認・修正できる。

---

## 24. 戸籍入力モード

日本戸籍を読みながら入力するための専用UI。

v0.6.0時点で、戸籍入力モード最小版は実装済みである。

### 24.1 実装済みの主な機能

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

### 24.2 将来強化

- 戸籍画像添付
- OCR支援
- AI読み取り支援
- 既存人物候補表示
- 同姓同名照合
- 戸籍単位の入力チェック

---

## 25. 人物詳細・関係編集UI

v0.6.0時点で、人物詳細パネルから以下が可能である。

- 人物基本情報編集
- Event追加・編集・削除
- Person Citation追加・編集・削除
- ParentChildRelation Citation追加・編集・削除
- Union Citation追加・編集・削除
- 親子関係削除
- Union削除
- 親子関係属性編集
- Union属性編集

相手人物の変更や高度な統合UIは将来対応とする。

---

# 第7部：家系図表示

---

## 26. 家系図表示方針

家系図本体はSVGで描画する。

家系図は単純なツリーではなく、PersonノードとUnionノードを持つ有向グラフとして扱う。

v0.6.0時点では、簡易独自レイアウトを採用する。ELK.js / React Flow / 複数ビュー本格対応は将来対応とする。

---

## 27. 対応ビュー

v0.6.0時点では、基本の家系図ビューを実装済みである。

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

## 28. 人物ノード表示

v0.6.0時点で、人物ノード表示密度を切り替えられる。

### 28.1 表示密度

| 表示密度 | 内容 |
|---|---|
| compact | 氏名中心の省スペース表示 |
| standard | 氏名・生没年・出典/確度の簡易ステータス |
| detailed | 氏名・生没年・称号・確度・確認状態・出典状態 |

### 28.2 生没年表示

例：

- `1900 - 1970`
- `1900 - `
- `? - 1970`

### 28.3 ノード強調

以下を見た目で分かるようにする。

- 出典なし
- 未確認
- 低確度
- 異説あり

---

## 29. 関係線表示

v0.6.0時点で、親子関係・Union関係の種別や状態を線で表現する。

### 29.1 親子線

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

### 29.2 Union線

| 条件 | 表示 |
|---|---|
| union_type = marriage | 通常の婚姻線 |
| union_type = partner | 破線 |
| union_type = concubine | 点線系 |
| union_type = unknown / other | 薄い線 |
| status = divorced または end_reason = divorce | 離婚系の線 |
| status = widowed または end_reason = death | 死別系の線 |
| status = ended | 終了済みの線 |

### 29.3 confidence / review_status反映

以下を線に反映する。

- confidence = uncertain
- confidence = disputed
- review_status = unreviewed

### 29.4 関係線凡例

家系図ビューに最小限の凡例を表示する。

- 実親子 = 実線
- 養親子 = 破線
- 継親子 = 点線
- 婚姻 = 実線
- 離婚/終了 = 警告色・破線
- 異説あり = 警告色

---

# 第8部：出力機能

---

## 30. 出力機能の基本方針

v0.6.0時点で、以下の出力に対応する。

- CSV出力
- 標準CSVセット出力
- JSONバックアップ
- PNG出力
- PDF出力
- SVG出力最小版

家系図表示部分は `treeRef` 配下のDOMを出力対象とし、操作UIは `data-html2canvas-ignore="true"` で除外する。

---

## 31. 出力用見た目設定

v0.6.0時点で、出力用見た目設定を画面状態として管理する。

### 31.1 設定項目

| 項目 | 内容 |
|---|---|
| showTitle | タイトル表示ON/OFF |
| title | 出力タイトル。空の場合は「家系図」扱い |
| showLegend | 凡例表示ON/OFF |
| background | white / transparent / soft |

### 31.2 現時点の制限

- DB永続化はしない。
- 将来ExportSettingへ移行予定。
- 本当の透過PNG生成は未対応。
- 用紙サイズ、ページ分割、余白詳細指定は未対応。

---

## 32. PNG出力

v0.6.0時点で、表示中の家系図DOMをPNGとして出力する。

含まれるもの：

- 出力タイトル
- 家系図本体
- 凡例ON時の凡例
- 背景設定

除外するもの：

- 家系図操作ツールバー
- 出力用見た目設定UI
- 出力ボタン

---

## 33. PDF出力

v0.6.0時点で、html2canvas + jsPDF によりPDF出力する。

現時点では表示中の家系図DOMをPDF化する最小版である。

将来対応：

- 用紙サイズ指定
- ページ分割
- 余白詳細指定
- 出典一覧付きPDF
- 高品質PDFレンダラー

---

## 34. SVG出力

v0.6.0時点で、SVG出力最小版を実装済みである。

### 34.1 方式

- `treeRef.current` 配下のDOMをclone
- clone内の `[data-html2canvas-ignore="true"]` 要素を削除
- `foreignObject` を含むSVG文字列を生成
- BlobとObject URLで `.svg` ファイルとして保存

### 34.2 含める内容

- 出力タイトル
- 家系図本体
- 凡例ON時の凡例
- 背景設定
- 最小限のstyle

### 34.3 除外する内容

- 操作ツールバー
- 出力用見た目設定UI
- 出力ボタン

### 34.4 制限

- `foreignObject` 利用のため、SVGビューアや印刷環境で再現性に差がある。
- 外部CSSの完全な取り込みは未対応。
- 印刷品質向けの完全調整は未対応。
- transparent背景はSVG上では透明扱い。

---

# 第9部：検証・検索・プライバシー

---

## 35. 検証機能

v0.6.0時点で、検証エンジンとValidationPanelを実装済みである。

### 35.1 検証対象

- persons
- unions
- parentChildRelations
- events
- sources
- citations

### 35.2 主な検証項目

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

### 35.3 ValidationPanel

- error / warning / info 件数表示
- severityフィルタ
- categoryフィルタ
- target_typeフィルタ
- 表示上限
- 検証結果から対象へ移動する導線
- person / event / union / relation issueから対象人物へ誘導
- source / citation issueは現時点では対象へ移動不可として安全表示

---

## 36. 検索・一覧機能

v0.6.0時点で、検索・一覧機能の最小版を実装済みである。

### 36.1 実装済み

- Person一覧
- Event一覧
- Source一覧
- Citation一覧
- Person検索・フィルタ
- Event検索・フィルタ
- Source / Citation検索・フィルタ
- Citation対象名表示
- Sourceクリックによる関連Citation絞り込み
- Person / Event / Citation / ValidationPanelからの対象移動
- 件数表示・0件表示
- 左側パネル縦長化への最低限対応
- スマホ幅での一覧・検索UI最低限対応

### 36.2 主な検索対象

- 氏名
- かな
- 旧姓
- 本籍
- 職業
- メモ
- 出典
- Event
- Source
- Citation
- Citation対象名

### 36.3 未対応または将来対応

- Relation / Union専用一覧
- 本格ソート
- ページネーション
- 仮想スクロール
- 一括編集
- Source詳細画面
- Citation詳細画面
- Event詳細編集UIへの本格ジャンプ

---

## 37. プライバシー設計

家系情報は個人情報性が高いため、初期版はローカル保存を基本とする。

将来対応：

- 生存者フラグ
- 非公開フラグ
- 公開用出力モード
- 本籍・住所の非表示
- 生年月日のマスク
- 非公開メモの除外
- 戸籍画像の除外
- JSONバックアップ時の注意表示

---

# 第10部：画面一覧

---

## 38. 現在の主な画面構成

v0.6.0時点では、単一画面内に主要機能を集約している。

主な構成：

- ヘッダー
- CSV / JSON / PNG / PDF / SVG 出力導線
- CSVインポート・標準CSVセット導線
- 左側パネル
  - 取込・レイアウト状況
  - 戸籍入力モード
  - データ検証結果
  - Person一覧
  - Event一覧
  - Source / Citation一覧
- 中央家系図ビュー
- 人物詳細パネル

ValidationPanel、Person一覧、Event一覧、Citation一覧からは、共通選択・ジャンプ基盤を通じて対象人物または関連人物へ移動できる。Source / Citation issueからの専用詳細ジャンプは将来対応とする。
## 39. 家系図画面

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
- PNG/PDF/SVG出力
- 出力時の操作UI除外

---

## 40. 将来画面

将来的に以下の画面を分離または追加する。

- ホーム画面
- 人物一覧専用画面
- Source一覧専用画面
- Event一覧専用画面
- Citation一覧専用画面
- CSVインポート専用画面
- 戸籍資料画面
- 矛盾チェック画面
- 設定画面

---

# 第11部：日付・和暦仕様

---

## 41. 日付管理方針

日付は以下を分けて管理する。

- 表示用日付
- 検索用開始日
- 検索用終了日
- 精度

v0.6.0時点では、検証用途として4桁西暦抽出の最小対応を実装済みである。

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

## 42. 和暦対応

将来的に最低限対応する元号：

- 明治
- 大正
- 昭和
- 平成
- 令和

江戸以前の元号対応はさらに将来課題とする。

---

# 第12部：GEDCOM・親等・相続

---

## 43. GEDCOM対応

v0.6.0時点ではGEDCOM対応は未実装。

ただし、データ構造はGEDCOMに変換しやすいよう、Person / Union / Event / Source / Citation を分離している。

将来対応：

- GEDCOM 5.5.1エクスポート
- GEDCOM 7エクスポート
- GEDCOMインポート
- メディア付きZIP出力

---

## 44. 親等計算・相続関係

v0.6.0時点では未対応。

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

---

## 45. 推奨ディレクトリ構成

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
│  │  ├─ validationService.ts
│  │  ├─ layoutService.ts
│  │  ├─ exportImageService.ts
│  │  └─ backupService.ts
│  ├─ components/
│  │  ├─ FamilyTreeView/
│  │  ├─ PersonDetailPanel/
│  │  ├─ ValidationPanel/
│  │  └─ KosekiEntryPanel/
│  ├─ styles/
│  └─ tests/
└─ README.md
```

---

## 46. 主要サービス

### 46.1 csvImportService / csvExportService

- CSV読み込み
- 列マッピング
- 正規化
- 標準CSVセット入出力

### 46.2 backupService

- JSONバックアップ作成
- JSON復元
- schema_version確認

### 46.3 validationService

- 出典なし
- 未確認
- 低確度
- 参照切れ
- 自己参照
- 日付矛盾
- 年齢警告

### 46.4 layoutService

- DBデータから描画用ノード・エッジ生成
- Unionノード生成
- 簡易レイアウト計算
- 関係線用メタデータ付与

### 46.5 exportImageService

- PNG出力
- PDF出力
- SVG出力最小版
- SVG文字列生成
- 操作UI除外

---

# 第14部：テスト仕様

---

## 47. テスト方針

UIテストより先に、データ変換・正規化・検証・出力文字列生成をテストで固める。

v0.6.0時点で、Vitestにより主要機能のテストが整備されている。

---

## 48. 必須テスト

### 48.1 CSV / JSON

- CSVインポート
- 標準CSVセット入出力
- JSONバックアップ
- JSON復元
- Source / Citation / Eventの保持

### 48.2 データ検証

- 出典なし
- 未確認
- 低確度
- 参照切れ
- 自己参照
- 日付矛盾
- 年齢警告

### 48.3 家系図表示

- layoutNodes / layoutEdges生成
- Unionノード方式
- 表示密度切替
- 人物ノード表示
- 関係線クラス
- 凡例表示

### 48.4 出力

- PNG/PDF/SVGボタン表示
- 出力タイトルON/OFF
- 凡例ON/OFF
- 背景切替
- 操作UI除外
- SVG文字列生成
- SVG内のタイトル・人物名・凡例・背景

### 48.5 検索・一覧・選択導線

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

---

## 49. v0.6.0時点の到達条件

v0.6.0時点で、以下を満たす。

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
14. 出力タイトル・凡例・背景を設定できる。
15. PNG出力できる。
16. PDF出力できる。
17. SVG出力最小版が使える。
18. CSV/JSONでバックアップできる。
19. 共通選択・ジャンプ基盤がある。
20. Person一覧で検索・フィルタできる。
21. Event一覧で検索・フィルタできる。
22. Source / Citation一覧で検索・フィルタできる。
23. Citation対象名を表示できる。
24. Sourceクリックで関連Citationを絞り込める。
25. ValidationPanelからperson / event / union / relation対象へ移動できる。
26. Source / Citation issueは現時点では対象へ移動不可として安全表示される。
27. 左側パネルが縦長でも最低限使える。
28. スマホ幅でも一覧・検索UIが大きく崩れない。
29. Vitestで主要機能のテストが通る。
## 50. v1.0.0 安定版の目標

v1.0.0では、以下を安定版の基準とする。

- 戸籍・出典管理対応の基本機能が安定している。
- 検索・一覧・修正導線がある。
- CSVインポートが実用的に使える。
- Project / ViewSetting / ExportSetting / PrivacySetting の最小版がある。
- Name / Place の最小版がある。
- JSONバックアップ・復元が安定している。
- 出力機能が親族共有に耐える品質である。

---

# 第16部：AIコーディング向け実装プロンプト戦略

---

## 51. 基本方針

AIコーディングツールには、本仕様書全体を一括で「作って」と指示しない。必ず小さな単位に分割する。

v0.6.0までの開発では、この分割方針が有効だった。今後も同じ方針を維持する。

---

## 52. 今後の推奨プロンプト順

v0.6.0までの開発では、小さなフェーズに分割して、各段階でテストとビルドを通す進め方が有効だった。今後も同じ方針を維持する。

### v0.7.0：CSVインポート本格化

- v0.7 第1フェーズ：CSVインポート現状棚卸し
- v0.7 第2フェーズ：インポート結果プレビュー強化
- v0.7 第3フェーズ：取込方式選択
- v0.7 第4フェーズ：既存external_id照合強化
- v0.7 第5フェーズ：参照先不明・仮人物作成方針
- v0.7 第6フェーズ：標準CSVセット検証強化
- v0.7 第7フェーズ：ImportBatch最小版
- v0.7 第8フェーズ：インポート結果レポート
- v0.7 第9フェーズ：v0.7全体仕上げ確認
- v0.7 第10フェーズ：v0.7.0リリース固定

### v0.8.0：Project / 表示設定 / 出力設定 / プライバシー設定

- Projectモデル
- ViewSettingモデル
- ExportSettingモデル
- PrivacySetting相当
- 出力設定のDB永続化
- 公開用出力モードの準備

### v0.9.0：Name / Place 最小版

- Nameモデル
- Placeモデル
- CSV/JSON対応
- Person/Eventとの連携
- Citation対象としてのname/place本格化準備

### v1.0.0：安定版仕上げ

- README / RELEASE_NOTES整理
- テスト整理
- サンプルデータ整備
- GitHub Pages公開確認
- バックアップ互換性確認
- v1.0.0リリース固定
# 第17部：最終まとめ

---

## 53. 本アプリの中核価値

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
Unionノード方式で複雑な家系を表現できる
↓
SVGで見やすく表示できる
↓
表示密度・関係線凡例で意味が分かる
↓
手修正できる
↓
PDF / PNG / SVG / CSV / JSONで出力できる
↓
将来的にCSVインポート本格化・GEDCOM・親等計算・相続関係説明図へ拡張できる
```

---

## 54. 最重要設計判断

本仕様書における最重要判断は以下である。

1. 家系図をツリーではなく、Person + Unionの有向グラフとして扱う。
2. 内部IDとCSV用外部IDを分離する。
3. CSVサンプルファーストで開発する。
4. SVGを描画・出力の主軸にする。
5. 出典を事実単位に紐づける。
6. AI生成データを最初から確定扱いしない。
7. ローカルファーストで個人情報を安全に扱う。

この方針を崩さないことが、開発成功の条件である。

---

## 55. 現在の完成イメージ

v0.6.0時点では、ユーザーが以下を実行できる状態を目指す。

1. ChatGPTやExcelで家系データCSVを作る。
2. そのCSVを本アプリに読み込む。
3. アプリが人物・親子・配偶者関係を自動生成する。
4. 戸籍入力モードでSource / Citation / Eventを追加する。
5. 関係根拠を人物・親子関係・Unionに紐づける。
6. ValidationPanelで未確認・出典なし・矛盾を確認する。
7. Person一覧・Event一覧・Source / Citation一覧から登録済みデータを探す。
8. 検索・フィルタで修正対象を絞り込む。
9. 検証結果や一覧から人物詳細へ移動する。
10. 家系図をSVGで表示する。
11. 表示密度や関係線凡例で見やすく確認する。
12. 出力タイトル・凡例・背景を調整する。
13. 家系図をPNG/PDF/SVGで出力する。
14. データをCSV/JSONで保存する。
## 56. 将来の完成形

将来的には、本アプリを以下の方向へ拡張する。

- CSVインポート本格化
- Project / ViewSetting / ExportSetting
- PrivacySetting / 公開用出力モード
- Name / Place / Media
- Source / Citation詳細画面
- Event詳細編集UIへの本格ジャンプ
- GEDCOM対応
- 親等計算
- 相続関係説明図
- AIによる戸籍読み取り支援
- OCR
- クラウド同期
- 共同編集

ただし、最初から全部を実装しない。今後も、小さなフェーズに分けて、テストとビルドが通る状態を維持しながら拡張する。

---

## 57. 結論

Kakeizu Studio は、海外系譜ソフトの堅牢なデータ構造、日本向け家系図アプリの分かりやすい入力UI、AI時代のCSV一括生成ワークフローを統合した、戸籍ベース家系図作成アプリである。

v0.6.0時点で、CSVから家系図を作るMVP、戸籍・出典・Event管理、関係根拠、検証機能、家系図表示・出力強化、検索・一覧・検証結果からの修正導線まで到達している。

今後は、CSVインポート本格化、Project / ViewSetting / ExportSetting、Name / Placeへ進むことで、単なる家系図作図アプリではなく、戸籍調査と出典管理に耐える家系データ管理アプリへ育てていく。
