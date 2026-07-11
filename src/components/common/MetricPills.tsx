import type { ReactNode } from 'react';

export type MetricPillItem = {
  key: string;
  content: ReactNode;
};

type MetricPillsProps = {
  items: readonly MetricPillItem[];
};

export function MetricPills({
  items,
}: MetricPillsProps) {
  return (
    <div className="preview-metrics">
      {items.map((item) => (
        <span key={item.key}>{item.content}</span>
      ))}
    </div>
  );
}
