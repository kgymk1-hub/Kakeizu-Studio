# Kakeizu Studio v1.0 手動確認チェックリスト

v1.0リリース候補に対して、人が同じ手順で確認するためのテンプレートです。初期状態ではすべて未実施です。各項目はPASSまたはFAILのどちらか一方だけをチェックしてください。実施していない項目を完了扱いにしないでください。

## 実施情報

- 実施日：
- 実施者：
- 対象commit：
- 対象branch：
- 公開URLまたはlocalhost：
- OS：
- ブラウザ：
- ブラウザversion：
- desktop確認幅：
- mobile確認幅：
- 結果：未実施 / PASS / PASS WITH WARNINGS / FAIL

## A. 事前準備・データ保護

### MAN-001 現在データのJSONバックアップ
- [ ] PASS
- [ ] FAIL
- 操作：「JSONバックアップ」を実行する。
- 期待結果：ダウンロードファイルが作成され、空でない。
- 証跡・備考：

### MAN-002 置換確認
- [ ] PASS
- [ ] FAIL
- 操作：現在データを消してよい検証環境か確認する。
- 期待結果：復元操作が全置換であることを理解し、必要なバックアップがある。
- 証跡・備考：

### MAN-003 fixtureデータ確認
- [ ] PASS
- [ ] FAIL
- 操作：`samples/compatibility`のREADMEとfixture名を確認する。
- 期待結果：fixtureが架空データであり、過去の公式バックアップそのものではないことを確認できる。
- 証跡・備考：

## B. 起動・永続化

### MAN-004 アプリ起動
- [ ] PASS
- [ ] FAIL
- 操作：対象URLまたはlocalhostでアプリを開く。
- 期待結果：アプリが表示され、操作不能な初期エラーがない。
- 証跡・備考：

### MAN-005 Version表示
- [ ] PASS
- [ ] FAIL
- 操作：画面上のバージョン表示を確認する。
- 期待結果：`Version 0.9.0`が表示される。
- 証跡・備考：

### MAN-006 コンソール確認
- [ ] PASS
- [ ] FAIL
- 操作：ブラウザDevTools Consoleを確認する。
- 期待結果：致命的エラーがない。
- 証跡・備考：

### MAN-007 リロード後の永続化
- [ ] PASS
- [ ] FAIL
- 操作：データを作成または復元後、ページを再読込する。
- 期待結果：IndexedDBのデータが維持される。
- 証跡・備考：

### MAN-008 ブラウザ再起動後の永続化
- [ ] PASS
- [ ] FAIL
- 操作：ブラウザを閉じて再起動し、同じURLを開く。
- 期待結果：IndexedDBのデータが維持される。
- 証跡・備考：

## C. v1.0フル機能サンプル復元

### MAN-009 v1サンプル復元
- [ ] PASS
- [ ] FAIL
- 操作：`samples/kakeizu_studio_v1_sample.json`を「JSONバックアップ復元」する。
- 期待結果：復元完了メッセージが表示され、青葉家サンプルが表示される。
- 証跡・備考：

### MAN-010 v1サンプル件数
- [ ] PASS
- [ ] FAIL
- 操作：一覧や画面表示で主要件数を確認する。
- 期待結果：Person 7、Union 3、ParentChildRelation 6、Event 7、Source 4、Citation 27、Name 2、Place 4、ImportBatch 1を確認できる。
- 証跡・備考：

### MAN-011 家系図・関係表示
- [ ] PASS
- [ ] FAIL
- 操作：青葉家サンプルの家系図を確認する。
- 期待結果：3世代、biological / adoptive、婚姻中 / 死別が判別できる。
- 証跡・備考：

### MAN-012 ValidationとProject設定
- [ ] PASS
- [ ] FAIL
- 操作：ValidationPanel、ImportBatch履歴、Project / settingsを確認する。
- 期待結果：warning 2件、error 0件、ImportBatch履歴、Project / settingsが確認できる。
- 証跡・備考：

## D. 人物・関係編集

### MAN-013 Person選択・更新
- [ ] PASS
- [ ] FAIL
- 操作：Personを選択し、人物情報を更新する。
- 期待結果：選択状態と更新内容が画面に反映される。
- 証跡・備考：

### MAN-014 Person追加
- [ ] PASS
- [ ] FAIL
- 操作：新規Personを追加する。
- 期待結果：人物一覧と詳細に追加Personが表示される。
- 証跡・備考：

### MAN-015 Union追加・編集
- [ ] PASS
- [ ] FAIL
- 操作：サンプルを事前バックアップ後、Unionを追加・編集する。
- 期待結果：婚姻種別や状態が保存され、表示に反映される。
- 証跡・備考：

### MAN-016 ParentChildRelation追加・編集
- [ ] PASS
- [ ] FAIL
- 操作：親子関係を追加・編集する。
- 期待結果：biological / adoptiveなどのrelation_typeが表示に反映される。
- 証跡・備考：

### MAN-017 関係削除とCitation付き削除
- [ ] PASS
- [ ] FAIL
- 操作：バックアップ後、通常関係とCitationがある関係の削除を試す。
- 期待結果：削除確認や関連表示が破綻せず、必要に応じてバックアップから戻せる。
- 証跡・備考：

### MAN-018 キャンセル操作
- [ ] PASS
- [ ] FAIL
- 操作：人物・関係編集フォームでキャンセルする。
- 期待結果：未保存変更が反映されない。
- 証跡・備考：

## E. Event・Source・Citation

### MAN-019 Event追加・編集・削除
- [ ] PASS
- [ ] FAIL
- 操作：person / union / relation targetのEventを追加・編集・削除する。
- 期待結果：対象種別ごとに表示と保存ができる。
- 証跡・備考：

### MAN-020 Source追加・編集・削除
- [ ] PASS
- [ ] FAIL
- 操作：Sourceを追加・編集・削除する。
- 期待結果：資料一覧とCitation表示が破綻しない。
- 証跡・備考：

### MAN-021 Citation操作
- [ ] PASS
- [ ] FAIL
- 操作：Person / Event / Union / Relation Citationを追加・確認する。
- 期待結果：各targetのCitationが表示される。
- 証跡・備考：Source欠損時の安全表示は既存自動テストで扱うため、UIでは通常操作を確認する。

## F. Name・Place

### MAN-022 Name追加・検索・選択
- [ ] PASS
- [ ] FAIL
- 操作：Nameを追加し、名前・別名一覧で検索・選択する。
- 期待結果：Nameが一覧に表示され、Person.display_nameを置き換えない。
- 証跡・備考：

### MAN-023 Place追加・編集
- [ ] PASS
- [ ] FAIL
- 操作：Placeを追加・編集する。
- 期待結果：場所候補一覧と関連フォームでPlaceが利用できる。
- 証跡・備考：

### MAN-024 Place削除時の参照解除
- [ ] PASS
- [ ] FAIL
- 操作：Event / Sourceに紐づくPlaceを削除する。
- 期待結果：Event / Sourceの`place_id`が解除され、`place_text`等は不自然に置き換わらない。
- 証跡・備考：

### MAN-025 Name / Place Citation表示
- [ ] PASS
- [ ] FAIL
- 操作：Name対象・Place対象Citationを確認する。
- 期待結果：Citation target name / placeが表示される。
- 証跡・備考：

## G. 一覧・検索・選択・ジャンプ

### MAN-026 主要一覧検索
- [ ] PASS
- [ ] FAIL
- 操作：人物、出来事、資料 / 出典、名前・別名、場所候補を検索する。
- 期待結果：一致項目と0件表示が分かる。
- 証跡・備考：

### MAN-027 カード選択・ジャンプ
- [ ] PASS
- [ ] FAIL
- 操作：検索結果やカードを選択する。
- 期待結果：選択対象へスクロールまたは詳細表示される。
- 証跡・備考：

### MAN-028 filter操作
- [ ] PASS
- [ ] FAIL
- 操作：各一覧のfilterを変更する。
- 期待結果：表示対象が意図どおり絞り込まれる。
- 証跡・備考：

## H. ValidationPanel

### MAN-029 warning内訳
- [ ] PASS
- [ ] FAIL
- 操作：v1サンプル復元後、ValidationPanelを開く。
- 期待結果：warning 2件、uncertain relation、unreviewed eventが確認できる。
- 証跡・備考：

### MAN-030 warningから対象へ移動
- [ ] PASS
- [ ] FAIL
- 操作：warning項目から対象へ移動する。
- 期待結果：対象の詳細またはカードが選択される。
- 証跡・備考：

### MAN-031 error・broken reference確認
- [ ] PASS
- [ ] FAIL
- 操作：ValidationPanelのerrorと参照系警告を確認する。
- 期待結果：error 0件、missing citationなし、broken referenceなし。
- 証跡・備考：

## I. CSVインポート

### MAN-032 かんたんCSVプレビュー
- [ ] PASS
- [ ] FAIL
- 操作：既存`samples`またはサンプルCSVをかんたんCSV読み込みする。
- 期待結果：プレビューが表示され、warningとerrorが区別される。
- 証跡・備考：

### MAN-033 replace_all反映
- [ ] PASS
- [ ] FAIL
- 操作：CSV importを`replace_all`で実行する。
- 期待結果：インポート結果レポートとImportBatch履歴が表示される。
- 証跡・備考：

### MAN-034 preview_only方式
- [ ] PASS
- [ ] FAIL
- 操作：preview_only方式の扱いを確認する。
- 期待結果：実行不可として扱われ、データへ反映されない。
- 証跡・備考：

## J. 標準CSVセット

### MAN-035 標準CSVセットエクスポート
- [ ] PASS
- [ ] FAIL
- 操作：標準CSVセットをエクスポートする。
- 期待結果：ZIPがダウンロードされ、空でない。
- 証跡・備考：

### MAN-036 標準CSVセット読み込み
- [ ] PASS
- [ ] FAIL
- 操作：ZIP読み込みと複数ファイル読み込みを試す。
- 期待結果：プレビュー後、`replace_all`反映できる。
- 証跡・備考：

### MAN-037 標準CSV対象外ファイル
- [ ] PASS
- [ ] FAIL
- 操作：標準CSVセットのファイル一覧を確認する。
- 期待結果：Name / Placeは対象外で、`names.csv` / `places.csv` / `media.csv`がない。
- 証跡・備考：

## K. JSON schema 1.0〜1.4互換

### MAN-038 schema 1.0 / 1.1復元
- [ ] PASS
- [ ] FAIL
- 操作：データ保護後、`backup_schema_1_0.json`、`backup_schema_1_1.json`を順に復元する。
- 期待結果：復元成功、固有人物名、schemaに存在するデータ、不足データ補完を確認できる。
- 証跡・備考：

### MAN-039 schema 1.2 / 1.3復元
- [ ] PASS
- [ ] FAIL
- 操作：必要データを再バックアップ後、`backup_schema_1_2.json`、`backup_schema_1_3.json`を復元する。
- 期待結果：Event保持、schema 1.3の設定値保持、不足データ補完を確認できる。
- 証跡・備考：

### MAN-040 schema 1.4復元と再出力
- [ ] PASS
- [ ] FAIL
- 操作：`backup_schema_1_4.json`を復元し、その後「JSONバックアップ」を実行する。
- 期待結果：Name / Place保持、復元後のJSON出力がschema 1.4になる。
- 証跡・備考：

## L. Project・表示・出力・Privacy設定

### MAN-041 Project・表示設定
- [ ] PASS
- [ ] FAIL
- 操作：Project名、表示密度、関係凡例を変更・確認する。
- 期待結果：設定が画面に反映され、リロード後も維持される。
- 証跡・備考：

### MAN-042 Export設定
- [ ] PASS
- [ ] FAIL
- 操作：タイトル、凡例、背景を変更・確認する。
- 期待結果：出力プレビューまたは出力結果に反映される。
- 証跡・備考：

### MAN-043 Privacy設定
- [ ] PASS
- [ ] FAIL
- 操作：公開用出力モード、生存者日付マスク、private / hidden人物非表示を切り替える。
- 期待結果：公開用表示に反映され、元データ自体は変更されない。
- 証跡・備考：

## M. PNG・PDF・SVG・CSV・JSON出力

### MAN-044 CSV / JSON / 標準CSVセット出力
- [ ] PASS
- [ ] FAIL
- 操作：CSV出力、JSONバックアップ、標準CSVセットを実行する。
- 期待結果：各ファイルが作成され、空でない。通常JSONには公開用マスクを適用しない。
- 証跡・備考：

### MAN-045 PNG / PDF / SVG出力
- [ ] PASS
- [ ] FAIL
- 操作：PNG、PDF、SVGを出力する。
- 期待結果：各ファイルが空でなく、タイトル・凡例・公開用出力のマスクが確認できる。
- 証跡・備考：

## N. desktop・mobile表示

### MAN-046 desktop表示
- [ ] PASS
- [ ] FAIL
- 操作：1200px以上で人物一覧、出来事一覧、資料 / 出典一覧、Name / Place、検証結果、インポートプレビューを確認する。
- 期待結果：主要操作、カード選択、家系図キャンバスが利用できる。
- 証跡・備考：

### MAN-047 mobile表示
- [ ] PASS
- [ ] FAIL
- 操作：760px以下で主要画面を確認する。
- 期待結果：検索欄が横幅いっぱいになり、filterが自然に次行へ移動し、ボタン操作できる。
- 証跡・備考：

### MAN-048 横スクロール確認
- [ ] PASS
- [ ] FAIL
- 操作：desktop / mobileで横スクロール有無を確認する。
- 期待結果：意図しないページ全体の横スクロールがない。家系図キャンバスは必要に応じて操作できる。
- 証跡・備考：

## O. 最終復元・終了確認

### MAN-049 元データまたはv1サンプルへ復元
- [ ] PASS
- [ ] FAIL
- 操作：元データまたは`kakeizu_studio_v1_sample.json`へ復元する。
- 期待結果：不要なテストデータが残っていない。
- 証跡・備考：

### MAN-050 最終確認
- [ ] PASS
- [ ] FAIL
- 操作：ページ再読込、コンソールエラー確認、最終JSONバックアップを実行する。
- 期待結果：総合判定を記録できる状態になる。
- 証跡・備考：
