# Kakeizu Studio

## 概要

Kakeizu Studio は、戸籍・出典管理へ拡張できる React + TypeScript + Vite 製のローカルファースト家系図作成アプリです。ブラウザ内の IndexedDB（Dexie）へ保存するため、MVP公開版ではサーバーを使わずに人物・関係・資料・出典を扱えます。

**Version 0.2.0**

> v0.2.0では、戸籍入力モード、Eventモデル、戸籍入力モードからのEvent作成に対応しました。

## 公開URL

- GitHub Pages: <https://kgymk1-hub.github.io/Kakeizu-Studio/>

## 主な機能

- GitHub Pages 公開対応（Vite `base: '/Kakeizu-Studio/'`）
- Dexie によるローカル永続保存
- 単一CSV（`family_simple.csv`）インポート、CSVプレビュー、検証、列マッピング
- 日本語列名CSVの自動マッピング候補
- Person / Union / ParentChildRelation の管理
- Source / Citation の管理、資料一覧、人物単位Citation、Event単位Citation、関係単位Citation UI（v0.3 development）
- JSONバックアップ出力・復元（eventsを含む。旧1.0/1.1 JSONも `events` なしとして復元）
- 標準CSVセット（複数CSV + `manifest.json`）のZIPエクスポート、ZIPインポート、複数ファイル直接インポート
- SVG家系図表示、人物クリック選択、出典あり人物の印、選択人物ハイライト
- 拡大・縮小・全体表示・リセット・ドラッグ移動
- 人物詳細編集、人物に紐づくEvent（出生・死亡・婚姻・転籍・入籍・除籍など）の追加・編集・削除
- CSV / JSON / PNG / PDF 出力（PNG/PDF系ライブラリは dynamic import）


## v0.2.0: 戸籍入力モード / Eventモデル

戸籍入力モードは、戸籍・除籍・改製原戸籍などの資料を見ながら人物情報を入力するための最小入力モードです。戸籍を完全に構造化するのではなく、既存の Source / Citation 機能を活かして、資料を根拠として人物に紐づけることを目的にしています。

- 戸籍資料は Source として登録します。資料種別は現在戸籍、除籍、改製原戸籍、その他を選べます。
- 戸籍資料を選択した状態で人物を追加・更新すると、その人物に対する Citation が自動作成されます。
- 既存人物更新時は、空欄の入力項目では既存値を消さず、入力された項目だけを更新します。
- 同じ Source と Person の Citation がすでにある場合は重複作成せず、created_at を維持して既存Citationを更新します。
- 父・母・配偶者を任意で選択し、ParentChildRelation や Union を同時に作成できます。既存の同一関係がある場合は重複作成しません。
- 人物単位Citationに加えて、任意作成した出生・死亡Eventと追加Eventにも選択中戸籍資料へのCitationを自動付与できます。
- v0.3 developmentでは、父・母を登録した場合は `target_type: "relation"` / `target_id: ParentChildRelation.id`、配偶者を登録した場合は `target_type: "union"` / `target_id: Union.id` のCitationも自動作成または更新します。
- 出生Eventを作成する / 死亡Eventを作成するチェックを使うと、birth_date_text / death_date_text から人物紐づきEventを任意作成できます。既存の同一Person・event_type・date_textのEventは重複作成しません。
- 「追加Event」セクションから、出生・死亡以外の戸籍上の出来事を人物に紐づくEventとして追加できます。対応種別は marriage（婚姻）、divorce（離婚）、adoption（養子縁組）、recognition（認知）、entry_registry（入籍）、removal_registry（除籍）、transfer_registry（転籍）、name_change（氏名変更）、residence（居住）、occupation（職業）、title（称号・肩書）、other（その他）です。
- 追加Eventは、Event種別を選択し、日付テキスト・場所・説明・メモのいずれかを入力した場合だけ作成されます。同一Person・target_type・event_type・date_text・place_text・descriptionのEventが既にある場合は重複作成しません。
- 追加Eventは人物に紐づく出来事として保存されます。現時点では、追加Eventから人物基本情報や家系図関係（Union / ParentChildRelation）へ自動反映しません。
- OCRやAI読み取り、戸籍画像添付には未対応です。戸籍入力モードは手入力支援です。
- 戸籍入力モードで作成した Person / Source / Citation / Event / ParentChildRelation / Union は、JSONバックアップと標準CSVセットに含まれます。

### Eventモデル最小版

v0.2.0では、人物・関係そのものとは別に「出来事」を記録する Event モデルを追加しています。

- Eventは `event_type`、`target_type`、`target_id`、日付テキスト、場所、説明、確度、メモなどを持ちます。
- 現在のUIでは人物詳細画面から人物に紐づくEventを追加・編集・削除できます。
- EventにはEvent単位Citationを紐づけられます。同じSource/EventのCitationは重複作成せず更新します。
- Event削除時は、そのEventに紐づくEvent Citationも削除します。
- 未知のEvent種別やSource欠損Citationがあっても、画面が落ちないように安全表示します。
- 家系図ノード上にはEventを表示しません。家系図上の表示はv0.1.0と同じく人物・Union・親子関係が中心です。
- Personの `birth_date_text` / `death_date_text` と出生・死亡Eventは自動同期しません。どちらかを編集しても、もう一方は自動更新されません。
- marriage EventからUnionを自動作成したり、adoption EventからParentChildRelationを自動作成したりする機能は未対応です。

## 使い方

### 1. 単一CSVで取り込む

1. 左パネルの「CSVファイルを選択」、textarea貼り付け、または「サンプルCSVを読み込む」でCSVを入力します。
2. 「列マッピングへ進む」でCSV列をKakeizu Studio標準項目へ対応付けます。不要な列は「取り込まない（無視）」を選べます。
3. プレビューで行ごとの「正常」「警告あり」「エラーあり」を確認します。
4. 検証結果で warning / error 件数、人物数、Union数、親子関係数を確認します。
5. error がない場合のみ「家系図・資料・出典を置き換えてインポート実行」できます。warning のみの場合は確認ダイアログ後に反映できます。

単一CSVインポートは手軽な人物投入用です。Source / Citation / Event は単一CSVに含まれません。実行すると現在の人物・夫婦関係・親子関係・資料・出典・Event・インポート履歴はCSVの内容で全置き換えされ、既存の資料・出典・Eventも削除されます。資料・出典・Eventを保持した移行には、JSONバックアップまたは標準CSVセットを使ってください。

「サンプルCSVをダウンロード」から `kakeizu_sample_family.csv` を保存できます。「ChatGPT用プロンプトをコピー」も利用できます。

### 2. 標準CSVセットで出し入れする

標準CSVセットは、人物・夫婦関係・親子関係・資料・出典・Eventをまとめて移行・外部編集するための形式です。

- 「標準CSVセットをエクスポート」で `kakeizu_standard_csv_set.zip` を出力できます。
- Kakeizu Studioが出力したZIPは「標準CSVセットZIPをインポート」から再インポートできます。
- Excel等で編集する場合は、ZIPを展開してCSVを編集し、再ZIP化せず `manifest.json` と6つのCSVを「標準CSVセットの複数ファイルをインポート」からまとめて選択する方法を推奨します。
- インポート前にプレビューと issue 一覧を表示します。error がある場合は反映不可、warning のみの場合は確認後に反映できます。
- 反映時は人物・夫婦関係・親子関係・資料・出典・Event・インポート履歴を全置き換えします。

現時点のZIP読込は**無圧縮ZIP前提**です。Kakeizu Studioが出力したZIPは再インポート可能ですが、外部ツールで再圧縮したZIPは読めない場合があります。その場合は複数ファイル直接インポートを使ってください。

### 3. JSONバックアップを使う

- 「JSONバックアップ」でアプリ内部形式の `kakeizu_backup.json` を出力します。
- 「JSON復元」で現在の人物・Union・親子関係・資料・出典・Event・インポート履歴を全置き換え復元します。
- v0.2.0以降のJSONバックアップは `schema_version: "1.2"` として `events` を含みます。Event Citationは `citations` 内に `target_type: "event"` として保存されます。
- v0.3 developmentの関係単位Citationも新規フィールドを追加せず、JSONバックアップの `citations` 配列に保存されます。親子関係は `target_type: "relation"` / `target_id: ParentChildRelation.id`、夫婦関係は `target_type: "union"` / `target_id: Union.id` です。
- 旧形式バックアップのように `sources` / `citations` / `events` が存在しないJSONでも、空配列として扱うため復元できます。

### 4. 資料・出典を登録する

- 左パネルの「資料一覧」から資料（Source）を追加・編集・削除できます。
- 資料種別は「現在戸籍」「除籍」「改製原戸籍」「Web」「書籍」「聞き取り」「AI生成」「その他」から選べます。
- 資料を削除すると、その資料に紐づく人物出典（Citation）も削除されます。
- 家系図ノードまたは人物一覧から人物を選択し、右側の人物詳細パネルで人物単位の出典を追加・編集・削除できます。
- Sourceが欠損したCitationは「参照先資料なし」として安全に表示します。人物・Event・親子関係・夫婦関係のCitation表示で同じ扱いです。

### 5. 家系図ビューを操作する

- 家系図ビューはSVGベースのMVP簡易レイアウトです。
- 人物ノード、Unionノード、配偶者線、親子線を表示します。
- 人物ノードをクリックすると右側の人物詳細パネルが更新され、選択中人物はオレンジでハイライトされます。
- 出典がある人物は、人物詳細タイトル・人物一覧・家系図ノード上の印で判別できます。
- 「＋ 拡大」「− 縮小」で表示倍率を変更できます。
- 「全体表示」は家系図全体が見える基準表示に戻します。
- 「リセット」は拡大率とドラッグ移動量を初期状態に戻します。
- SVG上をドラッグすると表示位置を移動できます。
- 空データ時はCSVインポートを促す案内を表示します。

## データ形式

### 単一CSV

標準CSVヘッダーは以下です。

```csv
person_id,name,gender,birth_date,death_date,father_id,mother_id,spouse_ids,generation_no,title,note,source,confidence
```

日本語列名でも自動で候補マッピングします。例: `人物ID` / `個人ID` は `person_id`、`名前` / `氏名` / `人物名` は `name`、`父` / `父親` は `father_id`、`母` / `母親` は `mother_id`、`生年` / `生年月日` は `birth_date`、`配偶者` / `配偶者ID` は `spouse_ids` に対応します。

- **error**: `person_id` / `name` 不足、CSVパース失敗、同一人物を配偶者・親に指定、親子循環など、データ破損につながる問題です。error が1件でもあるCSVは取り込めません。
- **warning**: 存在しない親ID・配偶者IDなど、確認は必要だが取り込み自体は可能な問題です。warning のみの場合は確認ダイアログに同意後に取り込めます。

### 標準CSVセット

標準CSVセットZIP、または複数ファイル直接インポートでは以下の6ファイルを使います。CSVはUTF-8 BOM付きで出力されます。

```text
manifest.json
persons.csv
unions.csv
parent_child_relations.csv
sources.csv
citations.csv
events.csv
```

`manifest.json` は以下の形式です。

```json
{
  "app": "Kakeizu Studio",
  "format": "kakeizu_standard_csv_set",
  "schema_version": "1.0",
  "exported_at": "2026-07-06T00:00:00.000Z",
  "files": [
    "persons.csv",
    "unions.csv",
    "parent_child_relations.csv",
    "sources.csv",
    "citations.csv",
    "events.csv"
  ]
}
```

主な列は以下です。

```csv
persons.csv: id,external_id,name,gender,birth_date,death_date,generation_no,title,note,confidence,created_at,updated_at
unions.csv: id,external_id,partner1_id,partner2_id,union_type,start_date,end_date,note,created_at,updated_at
parent_child_relations.csv: id,parent_id,child_id,relation_type,confidence,note,created_at,updated_at
sources.csv: id,external_id,source_type,title,author_or_issuer,issued_date_text,obtained_date,repository,honseki_text,head_of_registry,registry_type,source_text,url,privacy_level,note,import_batch_id,created_at,updated_at
citations.csv: id,external_id,source_id,target_type,target_id,page_or_location,quote_text,interpretation,confidence,note,import_batch_id,created_at,updated_at
events.csv: id,external_id,event_type,target_type,target_id,date_text,date_from,date_to,place_text,description,confidence,review_status,note,import_batch_id,created_at,updated_at
```

一部の列名は内部フィールドへ対応付けています。たとえば `persons.csv` の `name` は `Person.display_name`、`birth_date` は `Person.birth_date_text`、`title` は `Person.rank_title`、`unions.csv` の `start_date` は `Union.marriage_date_text` として扱います。

### JSONバックアップ

JSONバックアップはアプリ内部形式そのものです。v0.2.0では `schema_version` は `1.2` で、`persons` / `unions` / `parent_child_relations` / `import_batches` / `sources` / `citations` / `events` をまとめて保持します。旧 `1.0` / `1.1` JSONで `events` が存在しない場合は空配列として扱います。普段のバックアップや、Kakeizu Studio間で完全に復元したい場合に向いています。

## GitHub Pages公開設定

- 公開URLは <https://kgymk1-hub.github.io/Kakeizu-Studio/> です。
- GitHub Pagesのプロジェクトページで公開するため、`vite.config.ts` に `base: '/Kakeizu-Studio/'` を設定しています。
- `npm run build` 後は、`dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっていることを確認してください。`/assets/...` のままだとプロジェクトページ配下で404になります。
- `manifest.json` とSVGアイコン参照も `/Kakeizu-Studio/` 配下です。
- 公開ページが真っ白画面になる場合は、以下を確認してください。
  - ブラウザDevToolsのNetworkタブで `/assets/...` が404になっていないか確認する。
  - `dist/index.html` のJS/CSS参照が `/Kakeizu-Studio/assets/...` になっているか確認する。
  - `manifest.json` や `/Kakeizu-Studio/icons/icon.svg` が404になっていないか確認する。
  - GitHub ActionsのPagesデプロイが成功しているか確認する。
  - ブラウザやService Workerのキャッシュを避けるため、`https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.2.0` のようにクエリを付けて開く。

## 既知の制限

- レイアウトはMVP簡易レイアウトであり、複雑な再婚・養子・異説・大規模家系図は将来改善予定です。
- ZIP読込は現時点では無圧縮ZIP前提です。
- 外部編集後は再ZIP化より複数ファイル直接インポートを推奨します。
- Eventは人物詳細パネルで確認・編集できますが、家系図ノード上にはまだ表示しません。Personのbirth/deathテキストとEventは現時点では自動同期しません。戸籍入力モードの追加Eventも人物基本情報や家系図関係へ自動反映しません。
- v0.3 developmentとして、人物詳細画面に「関係の出典」セクションを追加しました。選択中人物が関係する親子関係（ParentChildRelation）と夫婦関係（Union）について、Citationの確認・追加・編集・削除ができます。
- Citation target_typeの使い分けは、`person`: 人物、`event`: 出来事、`relation`: 親子関係、`union`: 夫婦関係です。`name` / `place` は将来用で、今回のUI対象外です。
- 関係単位CitationはJSONバックアップと標準CSVセットの `citations` / `citations.csv` に含まれます。標準CSVセットのインポート時には `relation` は既存ParentChildRelation、`union` は既存Unionを参照しているか検証します。
- 関係削除UIは未対応です。削除処理を追加する場合は、対象関係のCitationも同時に削除してください。
- GEDCOM、OCR、AI戸籍読み取り、戸籍画像添付・メディア添付は将来対応です。
- Shift_JIS CSV自動判定は未対応です。CSVはUTF-8で保存してください。
- PWAとしての高度なオフライン対応は今後調整します。
- Excel xlsx の直接入出力には未対応です。CSVを利用してください。

## 今後の予定

- 複雑な家系図レイアウトへの対応強化
- 関係単位Citation、Eventの高度検索・タイムライン、場所、氏名単位CitationのUI追加
- GEDCOM、OCR、AI読み取り、メディア添付の検討
- PWA / オフライン体験の改善

## 開発コマンド

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## v0.2.0公開確認

- 公開URL: <https://kgymk1-hub.github.io/Kakeizu-Studio/>
- キャッシュ回避確認: <https://kgymk1-hub.github.io/Kakeizu-Studio/?v=0.2.0>

### v0.2.0確認項目

- アプリが起動する
- サンプルCSVを取り込める
- 家系図が表示される
- 戸籍入力モードで人物を追加できる
- 戸籍入力モードでEventを作成できる
- 人物詳細でEventを追加・編集・削除できる
- JSONバックアップを出力できる
- 標準CSVセットをエクスポートできる
- 標準CSVセットにevents.csvが含まれる

### v0.2.0 タグ作成手順

タグは、すべてのPRをmainへマージし、GitHub Pages公開確認が終わった後、mainブランチ上で作成します。

v0.2.0として区切る場合は、mainブランチ上で以下を実行してください。

```bash
git tag v0.2.0
git push origin v0.2.0
```

GitHub上でReleaseを作る場合は、tag `v0.2.0` を使ってReleaseを作成してください。Release本文の下書きは `RELEASE_NOTES.md` の「GitHub Release body」を利用できます。
