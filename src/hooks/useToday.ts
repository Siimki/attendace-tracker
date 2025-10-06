import { useMemo } from 'react';
import { formatISO, utcToZonedTime } from 'date-fns-tz';

const TIMEZONE = typeof __APP_TIMEZONE__ !== 'undefined' ? __APP_TIMEZONE__ : 'Europe/Tallinn';

export function useToday() {
  return useMemo(() => {
    const now = new Date();
    const zoned = utcToZonedTime(now, TIMEZONE);
    return {
      iso: formatISO(zoned, { representation: 'date' }),
      display: zoned.toLocaleDateString('et-EE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      zoned,
    };
  }, []);
}
