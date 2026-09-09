"use client";

import { useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { HistoryTable } from "@/components/HistoryTable";
import { LoadingState } from "@/components/LoadingState";
import { ProgressChart } from "@/components/ProgressChart";
import { useHistory } from "@/hooks/useHistory";

export function HistoryClient() {
  const { items, loading, error, refresh, remove } = useHistory();
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(id: number) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6">
        <p className="eyebrow">Progress</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Saved visual estimates</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Only analysis statistics are stored. Original face images are not saved by default.
        </p>
      </section>
      <section className="glass-panel p-6">
        {loading ? <LoadingState label="Loading saved analyses…" /> : <ProgressChart items={items} />}
      </section>
      <section className="glass-panel p-6">
        {error ? <ErrorState message={error} onRetry={() => void refresh()} /> : null}
        {!loading && !error ? (
          <HistoryTable
            items={items}
            selected={selected}
            onToggle={toggle}
            onDelete={(id) => {
              void remove(id);
              setSelected((current) => current.filter((value) => value !== id));
            }}
          />
        ) : null}
      </section>
    </div>
  );
}
