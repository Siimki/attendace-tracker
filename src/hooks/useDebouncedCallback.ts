import { useMemo, useRef } from 'react';

type DebouncedFunction<T extends (...args: never[]) => void> = (
  ...args: Parameters<T>
) => void;

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  const timeoutRef = useRef<number>();

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          callback(...args);
        }, delay);
      }) as DebouncedFunction<T>,
    [callback, delay],
  );
}
