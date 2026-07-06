import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../css/Pagination.module.css';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPage?: (page: number) => void;
}

const buildPageRange = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
};

export const PaginationControls = ({
  page,
  totalPages,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onPage,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <div className={styles.bar}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        className={styles.btn}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className={styles.ellipsis}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => {
              if (p !== page) {
                onPage ? onPage(p) : (p < page ? onPrev() : onNext());
              }
            }}
            className={`${styles.btn} ${p === page ? styles.active : ''}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={styles.btn}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>

      <span className={styles.info}>
        Página {page} de {totalPages}
      </span>
    </div>
  );
};
