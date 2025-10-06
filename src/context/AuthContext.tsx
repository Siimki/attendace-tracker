import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import type { CoachId } from '../lib/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  coachId: CoachId | null;
  login: (password: string, coach: CoachId) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SHARED_PASSWORD = import.meta.env.VITE_SHARED_PASSWORD ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [coachId, setCoachId] = useState<CoachId | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((password: string, coach: CoachId) => {
    if (!SHARED_PASSWORD) {
      toast.error('Rakenduse parool pole seadistatud.');
      return;
    }

    if (password !== SHARED_PASSWORD) {
      toast.error('Vale parool');
      setIsAuthenticated(false);
      setCoachId(null);
      return;
    }

    setIsAuthenticated(true);
    setCoachId(coach);
    toast.success('Tere tulemast!');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCoachId(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      coachId,
      login,
      logout,
    }),
    [coachId, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth peab olema AuthProvideri sees');
  }
  return context;
}
