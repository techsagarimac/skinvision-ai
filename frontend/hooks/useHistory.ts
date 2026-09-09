"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteHistory, listHistory } from "@/lib/api";
import type { HistoryRecord } from "@/types/analysis";

export function useHistory() {
  const [items, setItems] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await listHistory();
      setItems(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saved analyses could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function remove(id: number) {
    await deleteHistory(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return { items, loading, error, refresh, remove };
}
