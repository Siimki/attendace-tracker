import { FormEvent, useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './Button';
import { Input } from './Input';

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (student: { name: string; birthYear: number; group: string }) => Promise<void>;
  groups: string[];
}

const currentYear = new Date().getFullYear();

export function AddStudentModal({ open, onClose, onSubmit, groups }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number>(currentYear - 10);
  const [group, setGroup] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setBirthYear(currentYear - 10);
      setGroup(groups[0] ?? '');
    }
  }, [open, groups]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        birthYear,
        group,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <Dialog.Panel className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-2xl">
          <Dialog.Title className="text-lg font-semibold text-white">Lisa uus õpilane</Dialog.Title>
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Nimi"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              label="Sünniaasta"
              name="birthYear"
              type="number"
              inputMode="numeric"
              min={currentYear - 20}
              max={currentYear - 5}
              value={birthYear}
              onChange={(event) => setBirthYear(Number(event.target.value))}
              required
            />
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span className="font-medium text-slate-100">Treeninggrupp</span>
              <select
                value={group}
                onChange={(event) => setGroup(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-base text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                {groups.map((groupOption) => (
                  <option key={groupOption} value={groupOption}>
                    {groupOption}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                Loobu
              </Button>
              <Button type="submit" disabled={loading}>
                Salvesta
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
