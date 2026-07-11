import type { PrivacySetting } from '../models';

type ProjectSettingsSummaryPanelProps = {
  projectName: string;
  privacySetting: PrivacySetting;
  onPublicOutputModeChange: (checked: boolean) => void;
  onMaskLivingDatesChange: (checked: boolean) => void;
  onHidePrivatePersonsChange: (checked: boolean) => void;
  onHideHiddenPersonsChange: (checked: boolean) => void;
};

export function ProjectSettingsSummaryPanel({ projectName, privacySetting, onPublicOutputModeChange, onMaskLivingDatesChange, onHidePrivatePersonsChange, onHideHiddenPersonsChange }: ProjectSettingsSummaryPanelProps) {
  return <section className="panel"><h2>プロジェクト / 設定</h2><p><strong>現在のプロジェクト:</strong> {projectName}</p><h3>公開用設定</h3><label><input type="checkbox" checked={privacySetting.public_output_mode} onChange={(e)=>onPublicOutputModeChange(e.target.checked)} />公開用出力モードを有効にする</label><label><input type="checkbox" checked={privacySetting.mask_living_dates} onChange={(e)=>onMaskLivingDatesChange(e.target.checked)} />生存者の日付を隠す</label><label><input type="checkbox" checked={privacySetting.hide_private_persons} onChange={(e)=>onHidePrivatePersonsChange(e.target.checked)} />private人物を非公開表示</label><label><input type="checkbox" checked={privacySetting.hide_hidden_persons} onChange={(e)=>onHideHiddenPersonsChange(e.target.checked)} />hidden人物を非公開表示</label><p className="help-text">公開用出力モードは表示・PNG/PDF/SVG出力時だけマスクし、DB上のPersonは書き換えません。</p></section>;
}
