# Kakeizu Studio v0.8 settings audit

## 第1フェーズ：Project / 設定系の現状棚卸し

- `src/App.tsx` は人物・Union・親子関係・Source・Citation・Event・ImportBatchと取込/出力状態を画面stateで保持していた。
- 家系図表示密度、出力タイトル表示ON/OFF、出力タイトル、凡例表示ON/OFF、背景設定は `FamilyTreeView` 内のReact stateとしてのみ管理され、DB永続化されていなかった。
- 公開用出力に関係する `is_living`、`privacy_level`、`honseki_text`、日付表示項目はPerson/Sourceモデルには存在するが、表示・出力時のマスク設定はなかった。
- JSON backupは従来 `schema_version: "1.2"` で、Person / Union / ParentChildRelation / ImportBatch / Source / Citation / Eventを含んでいた。
- Dexie schemaはversion(1)〜version(3)で、v0.7 ImportBatchテーブルとSource/Citation/Eventテーブルを維持していた。
- 既存ImportBatchテーブルはCSVインポート履歴として使われており、今回の設定追加では構造変更しない。

## 第2フェーズ：Projectモデル最小版

- `Project` を設定を束ねる最小単位として追加した。
- 当面は単一default project相当で、default project名は「既定プロジェクト」とする。
- Project一覧UI、複数Project切替、削除、複製、Project単位のデータ分離は行わない。
- Person / Union / Relation / Event / Source / Citation への `project_id` 付与は今回しない。

## 第3フェーズ：ViewSetting最小版

- `ViewSetting` は `tree_display_mode` と `show_relation_legend` をProjectに紐づけて保持する。
- 既存の表示密度初期値に合わせ、defaultは `standard` とする。
- 家系図表示密度はDBから読み込み、UI変更時に保存する。

## 第4フェーズ：ExportSetting最小版

- `ExportSetting` は `show_title` / `title` / `show_legend` / `background` をProjectに紐づけて保持する。
- 既存の出力見た目初期値に合わせ、タイトル表示ON、タイトル「家系図」、凡例ON、背景whiteをdefaultとする。
- PNG / PDF / SVGは表示中DOMを出力する既存方針を維持する。

## 第5フェーズ：出力設定DB永続化

- 起動時にProject / ViewSetting / ExportSetting / PrivacySettingを読み込み、なければdefaultを作成する。
- 表示密度および出力設定は変更時に即DB保存する。
- DB保存失敗時は画面stateを維持し、console errorに留めて致命的に壊さない。

## 第6フェーズ：PrivacySetting相当

- `PrivacySetting` を追加し、公開用出力モードとマスク方針をProjectに紐づける。
- defaultは `public_output_mode: false` のため、通常表示は既存と同じ。
- 安全側の初期方針としてprivate/hidden、本籍、生存者日付マスクをONにする。ただし適用は公開用出力モードON時のみ。

## 第7フェーズ：公開用出力モード

- 公開用出力モードON/OFFをUIで切り替える。
- ON時、家系図ノードの氏名・生没年表示を中心に、hidden/private人物を「非公開」、生存者日付を「生存中」または非表示にする。
- DB上のPersonは書き換えず、表示・出力時のみマスクする。
- JSONバックアップ、CSV出力、標準CSVセット出力は元データを対象とし、公開用専用出力は今回実装しない。

## 第8フェーズ：JSONバックアップ互換性

- 新しいJSONバックアップはProject / ViewSetting / ExportSetting / PrivacySettingを含むため `schema_version: "1.3"` とする。
- `schema_version: "1.0"` / `"1.1"` / `"1.2"` の復元互換を維持する。
- settingsがない古いJSONを復元した場合はdefault project / default settingsを補完する。
- Person / Union / Relation / Event / Source / Citationは従来通り復元し、設定追加で壊さない。

## Dexie schema変更の有無と理由

- Dexie schema versionを4に上げた。
- 理由はProject / ViewSetting / ExportSetting / PrivacySettingをDB永続化するため、`projects` / `viewSettings` / `exportSettings` / `privacySettings` テーブルを追加したため。
- version(1)〜version(3)の既存テーブル定義は維持し、ImportBatchテーブルも変更しない。

## JSON schema_version変更の有無と理由

- JSON backup `schema_version` を1.3に上げた。
- 理由はProject / settingsをバックアップ対象に含めるため。
- 1.2以前のJSON復元互換を維持し、不足するsettingsはdefaultで補完する。

## 既存データ互換性

- 既存の人物・関係・資料・出典・Event・ImportBatchデータ構造は変更しない。
- 既存DBに設定テーブルがない場合、起動時にdefault project / settingsを作成する。
- Person等への `project_id` は追加しないため、既存CSV・JSON・標準CSVセット構造への影響を抑える。

## 今回やらないこと

- v0.8.0リリース固定、package/App/README冒頭Version変更、RELEASE_NOTES正式リリース追記。
- 完全な複数Project切替、Project削除・複製、Project単位のインポート/エクスポート分離。
- Person / Union / Relation / Event / Source / Citation への `project_id` 一括追加。
- 公開用CSV出力、公開用JSONバックアップ、公開用PDF専用レイアウト。
- Name / Place、GEDCOM、親等計算、v0.9以降の機能。

## 補完フェーズ：表示設定・出力設定・公開用出力モードの責務整理

- `ViewSetting.show_relation_legend` は、通常画面上の家系図ビューに関係線凡例を表示するかどうかを表す。
- `ExportSetting.show_legend` は、PNG / PDF / SVG 出力対象に凡例を含めるかどうかを表す。
- 現行のPNG / PDF / SVG出力は表示中DOMを対象にするため、今回の補完フェーズでは安全側の最小実装として、画面凡例と出力凡例は連動扱いにした。UIにも「現時点では、画面表示の凡例と出力時の凡例は連動します。」と明記した。
- 公開用出力モードON時にhidden/private人物をマスク対象にする場合、詳細表示モードで個人特定につながり得る `rank_title` を表示しないよう補完した。表示用マスクデータでは `rank_title` / `occupation` / `honseki_text` / `note` を消す。DB上のPerson、JSONバックアップ、CSV出力、標準CSVセット出力の元データは書き換えない。
- この作業環境ではVitestのdefault fork poolが無出力で停止する事象があったため、npm testは `vitest run --pool=threads --fileParallelism=false` に変更した。テスト内容自体の意図は変えていない。

## 第9フェーズ：v0.8全体仕上げ確認

- 第1〜第8フェーズと補完フェーズの実装導線を確認し、起動時のdefault project / settings作成、読み込み、保存、表示反映、PNG / PDF / SVG出力反映、JSON backup 1.3作成、1.2以前復元時のdefault補完が一連でつながっていることを確認した。
- Projectはv0.8時点では単一default project相当で、設定管理の器としてのみ扱う。完全な複数Project切替、Project削除・複製、Person等への `project_id` 一括追加は行わない。
- ViewSettingは画面表示設定として `tree_display_mode` と `show_relation_legend` を保存・復元する。既存の表示密度切替は維持する。
- ExportSettingは出力設定として `show_title` / `title` / `show_legend` / `background` を保存・復元する。PNG / PDF / SVGは既存のDOMキャプチャ出力方針を維持する。
- PrivacySettingは公開用出力モードとして保存・復元する。`public_output_mode` OFFでは既存表示を維持し、ONでは表示・出力時だけhidden/private人物や生存者日付などを最低限マスクする。元のPersonデータ、CSV出力、JSONバックアップ、標準CSVセット出力は勝手にマスクしない。
- 画面凡例と出力凡例は責務上は `ViewSetting.show_relation_legend` と `ExportSetting.show_legend` に分けるが、現時点ではDOMキャプチャ方式のため連動扱いとする。完全分離は後続課題とする。
- JSON backup `schema_version: "1.3"` はProject / ViewSetting / ExportSetting / PrivacySettingを含めるための変更であり、`1.2` 以前のJSONはdefault settingsを補完して復元する。
- Dexie schema version 4は `projects` / `viewSettings` / `exportSettings` / `privacySettings` を追加するための変更であり、version(1)〜version(3)、既存ImportBatch、persons / unions / parentChildRelations / events / sources / citationsは維持する。
- CSVインポートv0.7機能、ImportBatch / ImportReport、標準CSVセット構造、Person/Event/Source/Citation一覧、ValidationPanelへの仕様変更は行わず、テストとビルドで影響がないことを確認する。

## 次フェーズ

- 次は v0.8 第10フェーズ：v0.8.0リリース固定。package/App/README冒頭Version、RELEASE_NOTES正式リリース追記、v0.8.0タグ手順の正式追記は第10フェーズで扱う。

## 第10フェーズ：v0.8.0リリース固定

v0.8.0リリース固定では、package / README / Appヘッダー / RELEASE_NOTES を0.8.0へ更新し、Project / 表示設定 / 出力設定 / プライバシー設定フェーズを正式版として固定した。

このリリースでは、Dexie schema version(4) と JSON backup schema_version 1.3 を維持する。
標準CSVセット構造、Person等への project_id 付与、完全な複数Project切替、公開用CSV/JSON出力は追加しない。
