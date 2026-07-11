import type { ValidationIssue } from '../models';

type ImportStatusPanelProps = {
  status: string;
  exporting?: string;
  isLoading: boolean;
  personCount: number;
  unionCount: number;
  relationCount: number;
  eventCount: number;
  warningCount: number;
  issues: ValidationIssue[];
};

export function ImportStatusPanel({ status, exporting, isLoading, personCount, unionCount, relationCount, eventCount, warningCount, issues }: ImportStatusPanelProps) {
  return <section className="panel"><h2>インポート・レイアウト状況</h2><p className="notice">{status}</p>{exporting && <p className="notice">{exporting}を出力中...</p>}{isLoading && <p className="notice">保存データを読み込み中...</p>}<p>{personCount}人 / Union {unionCount}件 / 親子 {relationCount}件 / Event {eventCount}件 / 警告 {warningCount}件</p>{issues.length===0 ? <p>エラー・警告なし</p> : <ul className="issue-list">{issues.map((i,idx)=><li key={idx} className={i.severity}>{i.severity}: {i.code}: {i.message}</li>)}</ul>}</section>;
}
