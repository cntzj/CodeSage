'use client';

import { useMemo, useState } from 'react';

import { DebtItem } from '@/types';

import { DebtCard } from './DebtCard';

const statusColumns: Array<{ key: DebtItem['status']; label: string }> = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

interface DebtBoardProps {
  items: DebtItem[];
  onStatusChange: (id: string, status: DebtItem['status']) => Promise<void>;
}

export function DebtBoard({ items, onStatusChange }: DebtBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      statusColumns.reduce<Record<DebtItem['status'], DebtItem[]>>(
        (acc, column) => {
          acc[column.key] = items.filter((item) => item.status === column.key);
          return acc;
        },
        {
          open: [],
          in_progress: [],
          resolved: [],
        },
      ),
    [items],
  );

  return (
    <section className="grid gap-3 xl:grid-cols-3">
      {statusColumns.map((column) => (
        <div
          key={column.key}
          className="card min-h-72 p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={async (event) => {
            event.preventDefault();
            const id = event.dataTransfer.getData('text/plain');
            if (id) {
              await onStatusChange(id, column.key);
            }
            setDraggingId(null);
          }}
        >
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
            {column.label} ({grouped[column.key].length})
          </h3>
          <div className="space-y-2">
            {grouped[column.key].map((debt) => (
              <div
                key={debt.id}
                draggable
                onDragStart={(event) => {
                  setDraggingId(debt.id);
                  event.dataTransfer.setData('text/plain', debt.id);
                }}
                onDragEnd={() => setDraggingId(null)}
                className={draggingId === debt.id ? 'opacity-50' : ''}
              >
                <DebtCard debt={debt} />
              </div>
            ))}
            {grouped[column.key].length === 0 ? (
              <p className="rounded-lg border border-dashed border-ink/20 p-3 text-xs text-ink/50">暂无条目</p>
            ) : null}
          </div>
        </div>
      ))}
    </section>
  );
}
