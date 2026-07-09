import { useCallback, useMemo, useState } from 'react';

export type DeleteTarget<T extends string | number = number> =
  | { type: 'single'; id: T }
  | { type: 'bulk'; ids: T[] };

interface UseDeleteConfirmOptions {
  singleTitle: string;
  bulkTitle: (count: number) => string;
  description?: string;
}

export function useDeleteConfirm<T extends string | number = number>({
  singleTitle,
  bulkTitle,
  description = 'Esta acción no se puede deshacer.',
}: UseDeleteConfirmOptions) {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget<T> | null>(null);

  const requestDelete = useCallback((id: T) => {
    setDeleteTarget({ type: 'single', id });
  }, []);

  const requestBulkDelete = useCallback((ids: T[]) => {
    if (ids.length === 0) return;
    setDeleteTarget({ type: 'bulk', ids });
  }, []);

  const closeDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const modalTitle = useMemo(() => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'bulk') return bulkTitle(deleteTarget.ids.length);
    return singleTitle;
  }, [deleteTarget, singleTitle, bulkTitle]);

  return {
    deleteTarget,
    isDeleteOpen: deleteTarget !== null,
    modalTitle,
    modalDescription: description,
    requestDelete,
    requestBulkDelete,
    closeDelete,
  };
}
