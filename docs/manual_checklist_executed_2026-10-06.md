# Kakeizu Studio v1.0 手動確認チェックリスト

現行仕様に合わせた手動確認の実施記録です。2026-10-05〜06の証跡を集約し、条件を確認できた項目だけPASSとしています。未完了の項目はチェックせず理由を記載しました。Source / Placeの専用詳細移動等、既知制限を機能完了と扱っていません。

## 実施情報

- 実施日：2026-10-06
- 実施者：Codexによるブラウザ操作とユーザーの確認操作
- 対象commit：PR #91 c7c8bad + ローカル検証文書
- 対象branch：codex-fix-standard-csv-state（ローカルHEADは元main、作業ツリーで検証）
- 公開URLまたはlocalhost：http://127.0.0.1:5173/Kakeizu-Studio/
- OS：Windows
- ブラウザ：Edge
- ブラウザversion：
- desktop確認幅：1280px
- mobile確認幅：390px
- 結果：50 PASS / 0 未確認。現行仕様・既知制限の範囲。MAN-008とMAN-045は2026-10-06のユーザー直接確認によりPASS。正式リリース・公開は別途未完了。

## A. 事前準備・データ保護

### MAN-001 現在データのJSONバックアップ
- [x] PASS
- [ ] FAIL
- 操作：「JSONバックアップ」を実行する。
- 期待結果：ダウンロードファイルが作成され、空でない。
- 証跡・備考：JSON (18)をDownloadsへ保存。空でない実ファイルを解析。

### MAN-002 置換確認
- [x] PASS
- [ ] FAIL
- 操作：現在データを消してよい検証環境か確認する。
- 期待結果：復元操作が全置換であることを理解し、必要なバックアップがある。
- 証跡・備考：架空サンプルの検証環境。復元は全置換で、(9)等のバックアップを保持。

### MAN-003 fixtureデータ確認
- [x] PASS
- [ ] FAIL
- 操作：`samples/compatibility`のREADMEとfixture名を確認する。
- 期待結果：fixtureが架空データであり、過去の公式バックアップそのものではないことを確認できる。
- 証跡・備考：samples/compatibility/README.mdを確認。代表fixtureであり過去の全出力パターンではない。

## B. 起動・永続化

### MAN-004 アプリ起動
- [x] PASS
- [ ] FAIL
- 操作：対象URLまたはlocalhostでアプリを開く。
- 期待結果：アプリが表示され、操作不能な初期エラーがない。
- 証跡・備考：Edgeのlocalhostで起動・操作。検証中のサーバー停止は同じ5173で再起動して復旧。

### MAN-005 Version表示
- [x] PASS
- [ ] FAIL
- 操作：画面上のバージョン表示を確認する。
- 期待結果：`Version 0.9.0`が表示される。
- 証跡・備考：Version 0.9.0を画面確認。

### MAN-006 コンソール確認
- [x] PASS
- [ ] FAIL
- 操作：ブラウザDevTools Consoleを確認する。
- 期待結果：致命的エラーがない。
- 証跡・備考：最終再読込後のブラウザerrorログは空。

### MAN-007 リロード後の永続化
- [x] PASS
- [ ] FAIL
- 操作：データを作成または復元後、ページを再読込する。
- 期待結果：IndexedDBのデータが維持される。
- 証跡・備考：読込完了を待ってPerson 7、Name 2、Place 4を確認。

### MAN-008 ブラウザ再起動後の永続化
- [x] PASS
- [ ] FAIL
- 操作：ブラウザを閉じて再起動し、同じURLを開く。
- 期待結果：IndexedDBのデータが維持される。
- 証跡・備考：ユーザーがEdge再起動後の人物7人・Name 2件・Place 4件を確認し「ここはokです」と回答。ユーザー直接確認によりPASS。

## C. v1.0フル機能サンプル復元

### MAN-009 v1サンプル復元
- [x] PASS
- [ ] FAIL
- 操作：`samples/kakeizu_studio_v1_sample.json`を「JSONバックアップ復元」する。
- 期待結果：復元完了メッセージが表示され、青葉家サンプルが表示される。
- 証跡・備考：フルサンプルJSONの復元完了を画面確認。

### MAN-010 v1サンプル件数
- [x] PASS
- [ ] FAIL
- 操作：一覧や画面表示で主要件数を確認する。
- 期待結果：Person 7、Union 3、ParentChildRelation 6、Event 7、Source 4、Citation 27、Name 2、Place 4、ImportBatch 1を確認できる。
- 証跡・備考：最終JSON (18): P7 / U3 / R6 / E7 / S4 / C27 / N2 / Place4 / Batch1。

### MAN-011 家系図・関係表示
- [x] PASS
- [ ] FAIL
- 操作：青葉家サンプルの家系図を確認する。
- 期待結果：3世代、biological / adoptive、婚姻中 / 死別が判別できる。
- 証跡・備考：3世代、実親子・養親子、婚姻中・死別を画面確認。

### MAN-012 ValidationとProject設定
- [x] PASS
- [ ] FAIL
- 操作：ValidationPanel、ImportBatch履歴、Project / settingsを確認する。
- 期待結果：warning 2件、error 0件、ImportBatch履歴、Project / settingsが確認できる。
- 証跡・備考：warning 2 / error 0、青葉家プロジェクト、ImportBatch履歴、表示設定を確認。

## D. 人物・関係編集

### MAN-013 Person選択・更新
- [x] PASS
- [ ] FAIL
- 操作：Personを選択し、人物情報を更新する。
- 期待結果：選択状態と更新内容が画面に反映される。
- 証跡・備考：称号変更、一覧・家系図反映、再読込保持を確認して元へ戻した。

### MAN-014 Person追加
- [x] PASS
- [ ] FAIL
- 操作：新規Personを追加する。
- 期待結果：人物一覧と詳細に追加Personが表示される。
- 証跡・備考：架空検証用人物を追加し、一覧・詳細で確認。

### MAN-015 Union追加・編集
- [x] PASS
- [ ] FAIL
- 操作：サンプルを事前バックアップ後、Unionを追加・編集する。
- 期待結果：婚姻種別や状態が保存され、表示に反映される。
- 証跡・備考：追加したUnionをpartner / divorcedへ変更し表示確認。

### MAN-016 ParentChildRelation追加・編集
- [x] PASS
- [ ] FAIL
- 操作：親子関係を追加・編集する。
- 期待結果：biological / adoptiveなどのrelation_typeが表示に反映される。
- 証跡・備考：追加した親子関係をadoptiveへ変更し表示確認。

### MAN-017 関係削除とCitation付き削除
- [x] PASS
- [ ] FAIL
- 操作：バックアップ後、通常関係とCitationがある関係の削除を試す。
- 期待結果：削除確認や関連表示が破綻せず、必要に応じてバックアップから戻せる。
- 証跡・備考：出典なしの母関係、Citation付き父関係・夫婦関係を削除。JSON (16)で追加Relation/UnionへのCitation 0を確認。

### MAN-018 未保存編集の取り消しと自動保存の区別
- [x] PASS
- [ ] FAIL
- 操作：Place編集で値を変更し、保存せず「新規入力に戻す」を押す。人物基本情報は変更時に自動保存されることを確認する。
- 期待結果：Placeの未保存変更は一覧へ反映されない。人物基本情報にはキャンセル機能がないため、検証後は元の値へ戻す。
- 証跡・備考：Placeの未保存変更を取り消し。人物は自動保存で元の値へ戻した。

## E. Event・Source・Citation

### MAN-019 Event追加・編集・削除
- [x] PASS
- [ ] FAIL
- 操作：人物詳細でperson対象Eventを追加・編集・削除する。サンプル内のunion / relation対象Eventは一覧表示と対象への移動を確認する。
- 期待結果：person対象の編集内容が保存される。union / relation対象Eventは正しい関係を表示し、選択先へ移動できる。現行UIはこれらのEventの追加・編集フォームを提供しない。
- 証跡・備考：person Eventの追加・編集・削除を確認。関係対象Eventの移動を修正し、養子縁組→青葉蓮、婚姻→青葉直人を確認。

### MAN-020 Source追加・編集・削除
- [x] PASS
- [ ] FAIL
- 操作：Sourceを追加・編集・削除する。
- 期待結果：資料一覧とCitation表示が破綻しない。
- 証跡・備考：資料追加・改名・削除、関連Citation解除とEventの出典なし表示を確認。

### MAN-021 Citation操作
- [x] PASS
- [ ] FAIL
- 操作：Person / Event / Union / Relation Citationを追加・確認する。
- 期待結果：各targetのCitationが表示される。
- 証跡・備考：Person / Event / Union / RelationのCitation追加と表示を確認。

## F. Name・Place

### MAN-022 Name追加・検索・選択
- [x] PASS
- [ ] FAIL
- 操作：Nameを追加し、名前・別名一覧で検索・選択する。
- 期待結果：Nameが一覧に表示され、Person.display_nameを置き換えない。
- 証跡・備考：Name追加・検索・人物選択・削除。主表示名不変を確認。

### MAN-023 Place追加・編集
- [x] PASS
- [ ] FAIL
- 操作：Placeを追加・編集する。
- 期待結果：場所候補一覧と関連フォームでPlaceが利用できる。
- 証跡・備考：Place追加・編集、一覧とEvent候補へ反映。

### MAN-024 Place削除時の参照解除
- [x] PASS
- [ ] FAIL
- 操作：Event / Sourceに紐づくPlaceを削除する。
- 期待結果：Event / Sourceの`place_id`が解除され、`place_text`等は不自然に置き換わらない。
- 証跡・備考：JSON (10)でEvent 2 / Source 1のplace_id解除と地名文字列保持を確認。

### MAN-025 Name / Place Citation表示
- [x] PASS
- [ ] FAIL
- 操作：Name対象・Place対象Citationを確認する。
- 期待結果：Citation target name / placeが表示される。
- 証跡・備考：name / place対象Citationのラベルを一覧で確認。

## G. 一覧・検索・選択・ジャンプ

### MAN-026 主要一覧検索
- [x] PASS
- [ ] FAIL
- 操作：人物、出来事、資料 / 出典、名前・別名、場所候補を検索する。
- 期待結果：一致項目と0件表示が分かる。
- 証跡・備考：全主要一覧の一致・0件を確認。mobileでも各検索を操作。

### MAN-027 カード選択・ジャンプ
- [x] PASS
- [ ] FAIL
- 操作：検索結果やカードを選択する。
- 期待結果：選択対象へスクロールまたは詳細表示される。
- 証跡・備考：Person / person・union・relation対象Event / Nameから人物詳細への選択を確認。Source / Placeの専用詳細移動はKL-023 / KL-028の対象外。

### MAN-028 filter操作
- [x] PASS
- [ ] FAIL
- 操作：各一覧のfilterを変更する。
- 期待結果：表示対象が意図どおり絞り込まれる。
- 証跡・備考：gender / Event種別 / Citation target / Name種別 / Place種別 / Validation categoryを操作し解除。

## H. ValidationPanel

### MAN-029 warning内訳
- [x] PASS
- [ ] FAIL
- 操作：v1サンプル復元後、ValidationPanelを開く。
- 期待結果：warning 2件、uncertain relation、unreviewed eventが確認できる。
- 証跡・備考：warning 2件のlow_confidence / unreviewedを確認。

### MAN-030 warningから対象へ移動
- [x] PASS
- [ ] FAIL
- 操作：warning項目から対象へ移動する。
- 期待結果：対象の詳細またはカードが選択される。
- 証跡・備考：unreviewedから青葉遥と居住Eventへ移動。

### MAN-031 error・broken reference確認
- [x] PASS
- [ ] FAIL
- 操作：ValidationPanelのerrorと参照系警告を確認する。
- 期待結果：error 0件、missing citationなし、broken referenceなし。
- 証跡・備考：最終状態error 0、missing citation / broken referenceなし。

## I. CSVインポート

### MAN-032 かんたんCSVプレビュー
- [x] PASS
- [ ] FAIL
- 操作：既存`samples`またはサンプルCSVをかんたんCSV読み込みする。
- 期待結果：プレビューが表示され、warningとerrorが区別される。
- 証跡・備考：単一CSV 13列マッピング、9正常行、error 0 / warning 0のプレビュー。

### MAN-033 replace_all反映
- [x] PASS
- [ ] FAIL
- 操作：CSV importを`replace_all`で実行する。
- 期待結果：インポート結果レポートとImportBatch履歴が表示される。
- 証跡・備考：単一CSV全置換でPerson9 / U4 / R9 / E0、成功レポートと履歴を確認。

### MAN-034 preview_only方式
- [x] PASS
- [ ] FAIL
- 操作：preview_only方式の扱いを確認する。
- 期待結果：実行不可として扱われ、データへ反映されない。
- 証跡・備考：単一CSV・標準CSVとも追加・更新・既存スキップ・別ID追加で反映ボタン無効。

## J. 標準CSVセット

### MAN-035 標準CSVセットエクスポート
- [x] PASS
- [ ] FAIL
- 操作：標準CSVセットをエクスポートする。
- 期待結果：ZIPがダウンロードされ、空でない。
- 証跡・備考：標準CSVセットZIP 21,518 bytesをDownloadsで確認。

### MAN-036 標準CSVセット読み込み
- [x] PASS
- [ ] FAIL
- 操作：ZIP読み込みと複数ファイル読み込みを試す。
- 期待結果：プレビュー後、`replace_all`反映できる。
- 証跡・備考：ZIPとmanifest+6CSV複数選択をプレビューして全置換。JSON (14)/(15)と画面でP7/U3/R6/S4/C27/E7、N2/Place4を確認。

### MAN-037 標準CSV対象外ファイル
- [x] PASS
- [ ] FAIL
- 操作：標準CSVセットのファイル一覧を確認する。
- 期待結果：Name / Placeは対象外で、`names.csv` / `places.csv` / `media.csv`がない。
- 証跡・備考：ZIP内にnames.csv / places.csv / media.csvなし。CRC正常。

## K. JSON schema 1.0〜1.4互換

### MAN-038 schema 1.0 / 1.1復元
- [x] PASS
- [ ] FAIL
- 操作：データ保護後、`backup_schema_1_0.json`、`backup_schema_1_1.json`を順に復元する。
- 期待結果：復元成功、固有人物名、schemaに存在するデータ、不足データ補完を確認できる。
- 証跡・備考：schema 1.0の固有人物名・補完と、1.1の人物/Source/Citation保持を確認。1.1再出力 (11)はschema1.4。

### MAN-039 schema 1.2 / 1.3復元
- [x] PASS
- [ ] FAIL
- 操作：必要データを再バックアップ後、`backup_schema_1_2.json`、`backup_schema_1_3.json`を復元する。
- 期待結果：Event保持、schema 1.3の設定値保持、不足データ補完を確認できる。
- 証跡・備考：schema1.2のEvent保持、1.3のProject名と設定保持を確認。

### MAN-040 schema 1.4復元と再出力
- [x] PASS
- [ ] FAIL
- 操作：`backup_schema_1_4.json`を復元し、その後「JSONバックアップ」を実行する。
- 期待結果：Name / Place保持、復元後のJSON出力がschema 1.4になる。
- 証跡・備考：schema1.4のN1/Place1を画面確認、再出力 (12)もschema1.4。

## L. Project・表示・出力・Privacy設定

### MAN-041 Project・表示設定
- [x] PASS
- [ ] FAIL
- 操作：復元したProject名を確認し、表示密度と関係凡例を変更する。
- 期待結果：復元したProject名と変更した表示設定が画面に反映され、リロード後も維持される。現行UIはProject名の変更フォームを提供しない。
- 証跡・備考：Project名表示、密度・凡例変更、読込完了後の保持を確認。

### MAN-042 Export設定
- [x] PASS
- [ ] FAIL
- 操作：タイトル、凡例、背景を変更・確認する。
- 期待結果：出力プレビューまたは出力結果に反映される。
- 証跡・備考：タイトル・凡例・背景の変更とPNG/PDF描画を確認。

### MAN-043 Privacy設定
- [x] PASS
- [ ] FAIL
- 操作：公開用出力モード、生存者日付マスク、private / hidden人物非表示を切り替える。
- 期待結果：公開用表示に反映され、元データ自体は変更されない。
- 証跡・備考：hidden/private/生存日付マスクON/OFFを確認。JSON (17)のPerson配列はhidden検証fixtureと完全一致。

## M. PNG・PDF・SVG・CSV・JSON出力

### MAN-044 CSV / JSON / 標準CSVセット出力
- [x] PASS
- [ ] FAIL
- 操作：CSV出力、JSONバックアップ、標準CSVセットを実行する。
- 期待結果：各ファイルが作成され、空でない。通常JSONには公開用マスクを適用しない。
- 証跡・備考：通常CSV / JSON / 標準ZIPの実ファイルを確認。公開用モードでも通常JSONのPerson配列は保持。

### MAN-045 PNG / PDF / SVG出力
- [x] PASS
- [ ] FAIL
- 操作：PNG、PDF、SVGを出力する。
- 期待結果：各ファイルが空でなく、タイトル・凡例・公開用出力のマスクが確認できる。
- 証跡・備考：PNG/PDF描画とSVGのXML・マスク文字列を確認。通常版 kakeizu (1).svg は山田家、公開版 kakeizu (2).svg は青葉家で出力時点のサンプルが異なる。各ファイルを個別に確認する条件（人物・線・タイトル・凡例の欠けなし、公開版の非公開・生存中マスク）を説明後、ユーザーが「OKです」と回答。SVG単独表示はユーザー直接確認によりPASS。

## N. desktop・mobile表示

### MAN-046 desktop表示
- [x] PASS
- [ ] FAIL
- 操作：1200px以上で人物一覧、出来事一覧、資料 / 出典一覧、Name / Place、検証結果、インポートプレビューを確認する。
- 期待結果：主要操作、カード選択、家系図キャンバスが利用できる。
- 証跡・備考：1280×900pxで主要パネルの操作、インポートプレビューと折り返しを確認。

### MAN-047 mobile表示
- [x] PASS
- [ ] FAIL
- 操作：760px以下で主要画面を確認する。
- 期待結果：検索欄が横幅いっぱいになり、filterが自然に次行へ移動し、ボタン操作できる。
- 証跡・備考：390×844pxで人物/Event/Source・Citation/Name・Place/Validation/インポートプレビューを操作・目視。

### MAN-048 横スクロール確認
- [x] PASS
- [ ] FAIL
- 操作：desktop / mobileで横スクロール有無を確認する。
- 期待結果：意図しないページ全体の横スクロールがない。家系図キャンバスは必要に応じて操作できる。
- 証跡・備考：document / scrollWidth一致: mobile375/375、desktop1265/1265。

## O. 最終復元・終了確認

### MAN-049 元データまたはv1サンプルへ復元
- [x] PASS
- [ ] FAIL
- 操作：元データまたは`kakeizu_studio_v1_sample.json`へ復元する。
- 期待結果：不要なテストデータが残っていない。
- 証跡・備考：最終JSON (18)の9データ配列は元サンプルと完全一致。検証用データなし。

### MAN-050 最終確認
- [x] PASS
- [ ] FAIL
- 操作：ページ再読込、コンソールエラー確認、最終JSONバックアップを実行する。
- 期待結果：総合判定を記録できる状態になる。
- 証跡・備考：最終再読込・errorログ・JSONバックアップの照合と総合判定を記録。全条件PASSはまだ宣言しない。
