import type { Person } from '../../models';
import type { RelativeKind } from '../../services/familyEditService';

interface Props {
  person?: Person;
  onChange: (person: Person) => void;
  onAddRelative: (kind: RelativeKind) => void;
}

export function PersonDetailPanel({ person, onChange, onAddRelative }: Props) {
  if (!person) {
    return (
      <aside className="detail">
        <h2>人物詳細</h2>
        <p>人物ノードをクリックしてください。</p>
      </aside>
    );
  }

  const update = (key: keyof Person, value: string) => {
    onChange({ ...person, [key]: value, updated_at: new Date().toISOString() });
  };

  return (
    <aside className="detail">
      <h2>人物詳細</h2>
      <div className="quick-actions" aria-label="親族を追加">
        <button onClick={() => onAddRelative('father')}>父を追加</button>
        <button onClick={() => onAddRelative('mother')}>母を追加</button>
        <button onClick={() => onAddRelative('spouse')}>配偶者を追加</button>
        <button onClick={() => onAddRelative('child')}>子を追加</button>
      </div>
      <label>
        表示名
        <input
          value={person.display_name}
          onChange={(event) => update('display_name', event.target.value)}
        />
      </label>
      <label>
        生年月日
        <input
          value={person.birth_date_text ?? ''}
          onChange={(event) => update('birth_date_text', event.target.value)}
        />
      </label>
      <label>
        没年月日
        <input
          value={person.death_date_text ?? ''}
          onChange={(event) => update('death_date_text', event.target.value)}
        />
      </label>
      <label>
        称号
        <input
          value={person.rank_title ?? ''}
          onChange={(event) => update('rank_title', event.target.value)}
        />
      </label>
      <label>
        備考
        <textarea
          value={person.note ?? ''}
          onChange={(event) => update('note', event.target.value)}
        />
      </label>
    </aside>
  );
}
