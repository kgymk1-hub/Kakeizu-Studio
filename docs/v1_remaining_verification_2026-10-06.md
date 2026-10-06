# 継続検証の結果と残作業 2026-10-06

## 残検証を進めた結果

- 現行仕様と既知制限の範囲で、50項目すべてPASS。実施版は `manual_checklist_executed_2026-10-06.md`。MAN-008（ブラウザ全体の再起動）とMAN-045（SVG単独表示）は2026-10-06のユーザー直接確認により完了。正式リリース・公開は別途未完了。
- 標準CSVセットZIP、manifest + 6CSVの複数ファイル取り込み、両方のreplace_allを実ブラウザで実施。JSON `(14)` / `(15)`ではPerson 7 / Union 3 / Relation 6 / Event 7 / Source 4 / Citation 27 / Name 2 / Place 4。Name / Placeは反映直後と再読込後の両方で保持。結果レポート・ImportBatch履歴はcompleted_with_warnings（warning 4 / error 0）。warningはCSVに実体がないname / place対象Citationの既知制限。
- 単一CSVと標準CSVの追加・external_id更新・既存スキップ・別ID追加は、いずれも反映ボタンが無効。単一CSVの全置換では内蔵架空サンプルPerson 9 / Union 4 / Relation 9、資料・出典・Event 0、成功レポートを確認してから元サンプルへ戻した。
- 検証用人物に追加した母RelationのCitationを外して出典なし状態で削除。父RelationとUnionはCitation付きで削除。JSON `(16)`はRelation 6 / Union 3、追加関係を指すCitation 0。関係削除後も表示が破綻しない。
- 青葉翔太だけhiddenにした架空fixtureで公開用表示を検証。privateだけONでは美咲のみ非公開、hiddenもONでは翔太も非公開。生存日付ONで生存中、OFFで日付へ戻る。通常JSON `(17)`のPerson配列は検証fixtureと完全一致。
- desktop 1280×900、mobile 390×844で主要検索・フィルタ・カード・Validation・インポートプレビューを確認。document / scrollWidthはdesktop 1265 / 1265、mobile 375 / 375。viewport overrideは解除。
- 関係対象Eventのカードクリックが人物詳細へ移動しないことを発見し修正。既存のUnion / Relation選択へ解決し、婚姻Eventは青葉直人、養子縁組Eventは青葉蓮へ移動することを実機確認。不正な自己参照Eventが再帰しないテストも追加。
- 最終状態は青葉家サンプル。JSON `(18)`のpersons / unions / parent_child_relations / events / sources / citations / names / places / import_batchesは、並び順を揃えて元fixtureと完全一致。再読込後Person 7 / Name 2 / Place 4、コンソールerrorログ空。
- Vitest 33ファイル / 343テストPASS（38.41秒）、TypeScript、production build、diff whitespace確認PASS。Viteチャンクサイズ警告は継続。
- 修正PR #91はmainへ統合済み（2026-10-06確認）。main `baa5e241a5057c01304ce2d11f86db386298b3f3`。統合Dの版更新・正式公開へ進む。
- 検証中にlocalhostサーバー停止を観測。Viteを同じ5173で起動して復旧した。これは保存データ喪失ではなく、復旧後の読込とJSONで保持を確認した。

### ユーザー直接確認の完了

1. MAN-008：Edge再起動後、人物7人 / Name 2件 / Place 4件を確認し「ここはokです」と回答。PASS。
2. MAN-045：通常版 `kakeizu (1).svg` は山田家、公開版 `kakeizu (2).svg` は青葉家。出力時点のサンプルが異なるため同一家系の比較とは扱わず、各ファイルの欠けなし・公開版の非公開／生存中マスクを個別に確認する条件を説明。ユーザーが「OKです」と回答。PASS。

残る手動操作待ちはない。50項目すべてPASS。Source / Placeの専用詳細へのカード移動は現行UIの既知制限であり、MAN-027の確認はPerson / Name / Eventの対応範囲と既存の編集ボタンについて記録している。PRの統合・版更新・タグ・GitHub Release・Pages公開の完了とは区別する。

## 今回の変更

### 最新の再開結果

- 削除確認が見当たらないとの連絡後、既存のEdge検証タブへ再接続。対象Placeはまだ存在し、confirmは閉じていたため、承認済みの対象だけ確認を開き直した。
- ネイティブAXから確認文とOKボタンを取得できた。OK操作は「No dialog is showing」を返したが、直後の画面とダウンロードJSONでは削除完了を確認した。エラーだけで失敗と判断してクリックを繰り返さない。
- MAN-024確認完了。`kakeizu_backup (10).json`でPlace 3件、Event `sample-event-02` / `sample-event-03`のplace_id解除、両方のplace_text保持、Source `sample-source-01`のplace_id解除とhonseki_text保持を確認。今回追加したEventのPlace参照も解除済み。
- schema 1.1復元成功。固有人物名「互換確認 一一」、Source 1 / Citation 1を確認。再出力 `(11).json`はschema 1.4、Event / Name / Placeは0件。
- schema 1.4復元成功。固有人物名「互換確認 一四」、Name 1 / Place 1を画面確認。再出力 `(12).json`もschema 1.4、Source 1 / Event 1 / Citation 4 / Name 1 / Place 1を保持。
- 青葉家サンプルを再復元。最終JSON `(13).json`はPerson 7 / Union 3 / Relation 6 / Event 7 / Source 4 / Citation 27 / Name 2 / Place 4。検証用人物は0件。この削除・復元について手動操作待ちは解消した。
- 証跡: `place-test-restored-2026-10-06.jpg`。以下の停止・承認記述は再開前の履歴として残している。正式リリースの全条件完了は意味しない。

- 標準CSVセット反映時、Name / PlaceがDBには残るのに画面から消える不具合を修正。修正前は実CSV取り込みを通すApp回帰テストで0件表示を再現。修正後は反映直後と再マウント後の両方でName 2 / Place 4件を維持する。
- MAN-018 / MAN-019 / MAN-041の操作を現行仕様に合わせた。人物は自動保存、Project名は表示・復元、union / relation対象Eventは一覧と移動で確認する。未実施の結果をPASSには変更していない。
- 既知の制限にもProject名編集と関係対象Event編集のUI境界を明記。
- 33ファイル / 342テストPASS（40.22秒）。TypeScript、Vite production build PASS。チャンクサイズ警告あり。

## 今回追加で確認できた操作

| 確認 | 結果 |
| --- | --- |
| MAN-014 人物追加 | 架空の検証用人物を戸籍入力から追加。一覧と詳細を確認。 |
| MAN-015 夫婦関係追加・編集 | 同時追加した関係をpartner / divorcedへ変更。詳細と家系図の種別・状態に反映。 |
| MAN-016 親子関係追加・編集 | 父母の関係を2件追加。父側をadoptiveへ変更し、家系図の養親子表示を確認。 |
| MAN-020 Source追加・編集・削除 | 架空資料を追加・改名。人物とEventへの出典を付け、ユーザーの確認OK後に削除。Source 5→4、Citation 33→31、Eventは「出典なし」と安全表示。 |
| MAN-021 Citation | 新規人物・親子・夫婦関係へのCitationと、追加Eventへの引用を画面確認。人物へ新しいSourceのCitationも追加。 |
| MAN-023 Place追加・編集 | 今回のPlace追加で一覧5件とEvent候補を確認。編集は前回検証済み。 |
| MAN-024 Place削除 | 検証用Placeの削除確認を開き、ユーザーのOK回答を受領。処理完了後の再観測は次の確認待ちで未完了。既存Placeについては下記の具体的な承認待ち。 |

削除前バックアップ: `C:/Users/user/Downloads/kakeizu_backup (9).json`、47,572 bytes、2026-10-06 14:01:16、schema 1.4。Person 8 / Union 4 / Relation 8 / Event 8 / Source 5 / Citation 33 / Name 2 / Place 5。最終復元用の元サンプルは `samples/kakeizu_studio_v1_sample.json` とDownloads内のサンプルバックアップに保持されている。

## 再開前の停止箇所（履歴）

ブラウザはconfirm待ち。ネイティブ確認の自動acceptは `Emulation.setFocusEmulationEnabled` でタイムアウトする。資料削除はユーザーの手動OKで完了を観測した。

既存サンプルのPlace「新潟県青葉市（架空市）」を削除する操作は、自動承認レビューが拒否した。理由は、この既存対象への明示的な削除承認がなく、非自明なアプリ状態を失う可能性があるため。その後、具体的な対象、Source 1件 / Event 2件の参照解除、バックアップからの復元を示し、ユーザーから「削除・参照解除の検証を承認する」を受領した。承認不足は解消したが、現在のconfirm対象はAPIから読み取れず、自動acceptも応答しないため、対象を限定した手動OKを依頼している。承認だけで削除完了とは扱わない。

## 再開時に整理した順序（履歴）

1. 表示中の確認の対象をユーザーと確認し、承認内容に応じてOKまたはキャンセルする。検証用Place削除後のEvent参照解除を再観測する。
2. 承認された場合だけ既存Placeを削除し、Source / Eventのplace_id解除と文字列項目の保持をJSON実ファイルで確認する。
3. 今回追加した関係について、出典なし・出典付きの削除と関連Citationの解除を確認する。
4. schema 1.1復元、schema 1.4復元後のJSON再出力を検証する。いずれも確認ダイアログの手動OKが必要。
5. 標準CSVセットZIPと複数ファイルのプレビュー・preview_only・replace_all往復を検証する。warning付き反映は手動OKが必要。今回のName / Place表示修正も実ブラウザで確認する。
6. 公開用設定のhidden人物等の未確認条件、desktop / mobile主要画面を確認する。
7. 青葉家サンプルへ戻し、今回追加した検証データが残らないことをJSONで確認する。
8. SVG単独表示とブラウザ全体の再起動後永続化はユーザーの直接操作で確認する。file URLのブラウザ操作は安全ポリシーで拒否されたため迂回しない。
9. 手動50項目を総合判定し、未達条件がなくなってから版更新・タグ・GitHub Release・Pages公開へ進む。

## GitHub

- PR #90はGitHub上で統合済み。現在のmain: `4da41439cbdee1ed0fa008da6dd65891f5de250d`（今回取得時点）。
- 今回の追加修正: Draft PR https://github.com/kgymk1-hub/Kakeizu-Studio/pull/91
- Branch: `codex-fix-standard-csv-state`。統合済みmainを基準に作成。
- ローカルHEADは元のmainのまま。`.git`を書き換えずGitHubコネクターで変更を記録した。作業ツリーにはPR #90の既存差分と今回の差分、ローカル検証文書・画像が残る。
- v1.0.0への版更新、正式タグ、Release作成は未実施。全手動条件のPASSを意味しない。
