import { useState } from 'react';
import { ArrowPathIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StudentRow } from '../components/StudentRow';
import { AddStudentModal } from '../components/AddStudentModal';
import { useRoster } from '../context/RosterContext';
import { useToday } from '../hooks/useToday';
import { useAuth } from '../context/AuthContext';

export function AttendancePage() {
  const today = useToday();
  const {
    filteredStudents,
    loading,
    search,
    setSearch,
    attendanceDraft,
    setAttendanceDraft,
    toggleAttendance,
    saveToday,
    refreshRoster,
    groups,
    groupColors,
    addStudent,
    removeStudent,
  } = useRoster();
  const { logout, coachId } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kohaloleku tabel</h1>
            <p className="text-sm text-white/70">{today.display}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={logout}>
              Logi välja
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            label="Otsi nime või gruppi"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Sisesta otsingusõna"
          />
          <div className="flex gap-2 sm:w-72">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => refreshRoster()}
              disabled={loading}
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" aria-hidden="true" />Värskenda
            </Button>
            <Button type="button" className="flex-1" onClick={() => saveToday()} disabled={loading}>
              Salvesta
            </Button>
          </div>
        </div>
      </header>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Õpilased</h2>
          <Button type="button" variant="secondary" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" /> Lisa õpilane
          </Button>
        </div>
        {loading && <p className="text-sm text-white/60">Laen andmeid...</p>}
        {!loading && filteredStudents.length === 0 && (
          <div className="rounded-3xl border border-white/5 bg-slate-900/80 p-8 text-center text-white/70">
            Lisa esimene õpilane
          </div>
        )}
        <div className="flex flex-col gap-3">
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              present={attendanceDraft[student.id] ?? false}
              groupColor={groupColors[student.group]}
              onToggle={(value) => setAttendanceDraft(student.id, value)}
              onLateToggle={(value) => toggleAttendance(student.id, value)}
              onRemove={() => removeStudent(student.id)}
            />
          ))}
        </div>
      </section>
      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addStudent}
        groups={groups}
      />
      <footer className="mt-auto flex flex-col gap-2 py-6 text-xs text-white/40">
        <p>
          Coach: {coachId ?? 'Valimata'} • Kellaaeg: {today.zoned.toLocaleTimeString('et-EE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p>Andmete alus: Google Sheets • Ajavöönd: Europe/Tallinn</p>
      </footer>
    </div>
  );
}
