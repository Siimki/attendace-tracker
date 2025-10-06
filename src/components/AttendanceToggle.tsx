import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface AttendanceToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  present: boolean;
}

export function AttendanceToggle({ present, className, ...props }: AttendanceToggleProps) {
  return (
    <button
      type="button"
      className={clsx(
        'flex h-10 w-16 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        present
          ? 'border-brand bg-brand/20 text-brand-light focus-visible:outline-brand'
          : 'border-white/20 bg-white/5 text-white/70 focus-visible:outline-white',
        className,
      )}
      {...props}
    >
      {present ? 'Kohal' : 'Puudus'}
    </button>
  );
}
