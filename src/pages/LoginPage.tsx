import { FormEvent, useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [coachId, setCoachId] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(password, coachId);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-10 px-6 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold text-white">Pärnu Kalevi Jalgrattakool</h1>
        <p className="text-sm text-white/70">Treeningute kohaloleku jälgimine</p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-slate-900/90 p-8 shadow-xl"
      >
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-medium uppercase tracking-wide text-white/70">
            Vali treener
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((coach) => (
              <Button
                key={coach}
                type="button"
                variant={coachId === coach ? 'primary' : 'secondary'}
                onClick={() => setCoachId(coach as 1 | 2)}
                fullWidth
              >
                Treener {coach}
              </Button>
            ))}
          </div>
        </fieldset>
        <Input
          label="Parool"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" fullWidth>
          Logi sisse
        </Button>
      </form>
    </div>
  );
}
