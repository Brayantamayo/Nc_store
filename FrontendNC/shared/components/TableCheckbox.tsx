import { Check, Minus } from 'lucide-react';
import styles from '../../src/features/panel/css/Admin.module.css';

interface TableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const TableCheckbox = ({
  checked,
  indeterminate = false,
  onChange,
  label,
  size = 'md',
}: TableCheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={indeterminate ? 'mixed' : checked}
    aria-label={label}
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={[
      styles.prettyCheckbox,
      size === 'sm' ? styles.prettyCheckboxSm : '',
      checked ? styles.prettyCheckboxChecked : '',
      indeterminate ? styles.prettyCheckboxIndeterminate : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {indeterminate ? (
      <Minus size={size === 'sm' ? 9 : 11} strokeWidth={3} />
    ) : checked ? (
      <Check size={size === 'sm' ? 10 : 12} strokeWidth={3} />
    ) : null}
  </button>
);
