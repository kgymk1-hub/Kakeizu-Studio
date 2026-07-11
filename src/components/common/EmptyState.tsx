import type { ReactNode } from 'react';

type EmptyStateProps = {
  children: ReactNode;
  className?: string;
};

export function EmptyState({
  children,
  className,
}: EmptyStateProps) {
  return <p className={className}>{children}</p>;
}
