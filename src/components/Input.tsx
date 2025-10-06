import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, error, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="flex w-full flex-col gap-1 text-sm text-slate-200" htmlFor={inputId}>
        {label && <span className="font-medium text-slate-100">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand',
            className,
            error && 'border-rose-500 focus-visible:outline-rose-500',
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </label>
    );
  },
);

Input.displayName = 'Input';
