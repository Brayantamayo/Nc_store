import { useCallback, useEffect, useState } from 'react';

export function useTableSelection<T extends string | number>(itemIds: T[], resetDeps: unknown[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  useEffect(() => {
    setSelectedIds(new Set());
  }, resetDeps);

  const toggle = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = itemIds.length > 0 && itemIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(itemIds);
    });
  }, [itemIds]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const removeFromSelection = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedIds.has(id));
  const someSelected = itemIds.some((id) => selectedIds.has(id));

  return {
    selectedIds,
    count: selectedIds.size,
    toggle,
    toggleAll,
    clear,
    removeFromSelection,
    isSelected: (id: T) => selectedIds.has(id),
    allSelected,
    someSelected,
  };
}
