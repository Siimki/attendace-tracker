import { useMemo, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { Student } from '../lib/types';
import { AttendanceToggle } from './AttendanceToggle';
import { Button } from './Button';

interface StudentRowProps {
  student: Student;
  present: boolean;
  groupColor?: string;
  onToggle: (present: boolean) => void;
  onRemove: () => Promise<void>;
  onLateToggle: (present: boolean) => Promise<void>;
}

export function StudentRow({
  student,
  present,
  groupColor,
  onToggle,
  onRemove,
  onLateToggle,
}: StudentRowProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pillStyles = useMemo(
    () => ({
      background: `${groupColor ?? '#334155'}33`,
      color: groupColor ?? '#FFFFFF',
      borderColor: groupColor ?? '#334155',
    }),
    [groupColor],
  );

  const handleImmediateToggle = async () => {
    const next = !present;
    onToggle(next);
    setIsSaving(true);
    try {
      await onLateToggle(next);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/80 p-4 shadow-sm">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <p className="text-base font-semibold text-white">{student.name}</p>
          <span
            className="rounded-full border px-2 py-0.5 text-xs font-semibold uppercase"
            style={pillStyles}
          >
            {student.group}
          </span>
        </div>
        <p className="text-xs text-white/60">
          {student.birthYear} • {student.attended} / {student.sessions} kohal •{' '}
          {Math.round(student.percentage * 100) / 100}%
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AttendanceToggle
          present={present}
          onClick={() => onToggle(!present)}
          disabled={isSaving}
        />
        <Button
          type="button"
          variant="ghost"
          className={clsx(
            'h-10 w-10 rounded-full border border-white/10 p-0 text-white/60 hover:text-brand-light',
          )}
          onClick={() => handleImmediateToggle()}
          disabled={isSaving}
        >
          {isSaving ? '...' : 'Hiljem'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-10 rounded-full border border-rose-500/30 p-0 text-rose-400 hover:bg-rose-500/20"
          onClick={() => setShowConfirm(true)}
        >
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Eemalda {student.name}</span>
        </Button>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Kas arhiveerime õpilase?</h3>
            <p className="mt-2 text-sm text-white/70">
              See kustutab kogu õpilase ajaloo. Jätka?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Loobu
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await onRemove();
                  setShowConfirm(false);
                }}
              >
                Arhiveeri
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
