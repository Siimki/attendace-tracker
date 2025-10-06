import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { apiRequest } from '../lib/api';
import type { GroupColorMap, RosterPayload, Student } from '../lib/types';
import { useToday } from '../hooks/useToday';
import { useAuth } from './AuthContext';

type AttendanceDraft = Record<number, boolean>;

type RosterState = {
  students: Student[];
  groups: string[];
  groupColors: GroupColorMap;
  loading: boolean;
  search: string;
  attendanceDraft: AttendanceDraft;
};

type RosterAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ROSTER'; payload: RosterPayload }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_ATTENDANCE'; payload: { id: number; present: boolean } }
  | { type: 'RESET_ATTENDANCE'; payload: AttendanceDraft };

const initialState: RosterState = {
  students: [],
  groups: [],
  groupColors: {},
  loading: false,
  search: '',
  attendanceDraft: {},
};

function reducer(state: RosterState, action: RosterAction): RosterState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ROSTER':
      return {
        ...state,
        students: action.payload.students,
        groups: action.payload.groups,
        groupColors: action.payload.groupColors,
      };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'TOGGLE_ATTENDANCE':
      return {
        ...state,
        attendanceDraft: {
          ...state.attendanceDraft,
          [action.payload.id]: action.payload.present,
        },
      };
    case 'RESET_ATTENDANCE':
      return { ...state, attendanceDraft: action.payload };
    default:
      return state;
  }
}

interface RosterContextValue {
  students: Student[];
  filteredStudents: Student[];
  loading: boolean;
  search: string;
  groups: string[];
  groupColors: GroupColorMap;
  attendanceDraft: AttendanceDraft;
  refreshRoster: () => Promise<void>;
  setSearch: (value: string) => void;
  toggleAttendance: (id: number, present: boolean) => Promise<void>;
  setAttendanceDraft: (id: number, present: boolean) => void;
  saveToday: () => Promise<void>;
  addStudent: (student: { name: string; birthYear: number; group: string }) => Promise<void>;
  removeStudent: (studentId: number) => Promise<void>;
}

const RosterContext = createContext<RosterContextValue | undefined>(undefined);

const API_ENABLED = Boolean(import.meta.env.VITE_API_BASE_URL);

const fallbackRoster: RosterPayload = {
  students: [
    {
      id: 1,
      name: 'Mari Maasikas',
      birthYear: 2010,
      group: 'U15',
      attended: 12,
      sessions: 18,
      percentage: 0.67,
      attendance: {},
    },
    {
      id: 2,
      name: 'Juhan Jalgratas',
      birthYear: 2009,
      group: 'U17',
      attended: 15,
      sessions: 18,
      percentage: 0.83,
      attendance: {},
    },
  ],
  groups: ['U13', 'U15', 'U17'],
  groupColors: {
    U13: '#3B82F6',
    U15: '#22C55E',
    U17: '#EF4444',
  },
  minBirthYear: new Date().getFullYear() - 20,
  maxBirthYear: new Date().getFullYear() - 5,
};

export function RosterProvider({ children }: { children: ReactNode }) {
  const today = useToday();
  const { coachId } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dateKey, setDateKey] = useState(today.iso);

  useEffect(() => {
    setDateKey(today.iso);
  }, [today.iso]);

  const refreshRoster = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (!API_ENABLED) {
        const draft = fallbackRoster.students.reduce<AttendanceDraft>((acc, student) => {
          acc[student.id] = student.attendance?.[dateKey] === 'P';
          return acc;
        }, {});
        dispatch({ type: 'SET_ROSTER', payload: fallbackRoster });
        dispatch({ type: 'RESET_ATTENDANCE', payload: draft });
        return;
      }
      const data = await apiRequest<undefined, RosterPayload>({ action: 'getRoster' });
      const draft = data.students.reduce<AttendanceDraft>((acc, student) => {
        acc[student.id] = student.attendance?.[dateKey] === 'P';
        return acc;
      }, {});
      dispatch({ type: 'SET_ROSTER', payload: data });
      dispatch({ type: 'RESET_ATTENDANCE', payload: draft });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Treeningute nimekirja laadimine ebaõnnestus',
      );
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dateKey]);

  useEffect(() => {
    refreshRoster();
  }, [refreshRoster]);

  const setSearch = useCallback((value: string) => {
    dispatch({ type: 'SET_SEARCH', payload: value });
  }, []);

  const setAttendanceDraft = useCallback((id: number, present: boolean) => {
    dispatch({ type: 'TOGGLE_ATTENDANCE', payload: { id, present } });
  }, []);

  const toggleAttendance = useCallback(
    async (id: number, present: boolean) => {
      if (!coachId) {
        toast.error('Vali treener, enne kui märgid kohalolekut.');
        return;
      }
      setAttendanceDraft(id, present);
      if (!API_ENABLED) {
        toast.success('Muutus salvestatud lokaalselt (API välja lülitatud)');
        return;
      }
      try {
        await apiRequest({
          action: 'upsertSingle',
          payload: {
            rowIndex: id,
            date: today.iso,
            present,
            coachId,
          },
        });
        toast.success('Salvestatud');
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Kohaloleku muutmine ebaõnnestus',
        );
      }
    },
    [coachId, setAttendanceDraft, today.iso],
  );

  const saveToday = useCallback(async () => {
    if (!coachId) {
      toast.error('Vali treener, enne kui salvestad.');
      return;
    }

    if (!API_ENABLED) {
      toast.success('Kohalolek märgitud lokaalselt (API välja lülitatud)');
      return;
    }
    try {
      await apiRequest({
        action: 'bulkUpsertDay',
        payload: {
          date: today.iso,
          coachId,
          entries: Object.entries(state.attendanceDraft).map(([id, present]) => ({
            rowIndex: Number(id),
            present,
          })),
        },
      });
      toast.success('Päeva kohalolek salvestatud');
      refreshRoster();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Salvestamine ebaõnnestus');
    }
  }, [coachId, refreshRoster, state.attendanceDraft, today.iso]);

  const addStudent = useCallback(
    async (student: { name: string; birthYear: number; group: string }) => {
      if (!coachId) {
        toast.error('Vali treener, enne kui lisad õpilase.');
        return;
      }
      if (!API_ENABLED) {
        const nextId = Math.max(0, ...state.students.map((s) => s.id)) + 1;
        const draft = {
          ...state.attendanceDraft,
          [nextId]: false,
        };
        dispatch({
          type: 'SET_ROSTER',
          payload: {
            ...fallbackRoster,
            students: [
              ...state.students,
              {
                id: nextId,
                name: student.name,
                birthYear: student.birthYear,
                group: student.group,
                attended: 0,
                sessions: 0,
                percentage: 0,
                attendance: {},
              },
            ],
          },
        });
        dispatch({ type: 'RESET_ATTENDANCE', payload: draft });
        toast.success('Õpilane lisatud (demo)');
        return;
      }
      try {
        await apiRequest({
          action: 'addStudent',
          payload: {
            ...student,
            coachId,
          },
        });
        toast.success('Õpilane lisatud');
        await refreshRoster();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Õpilase lisamine ebaõnnestus');
      }
    },
    [API_ENABLED, coachId, refreshRoster, state.attendanceDraft, state.students],
  );

  const removeStudent = useCallback(
    async (studentId: number) => {
      if (!coachId) {
        toast.error('Vali treener, enne kui eemaldad õpilase.');
        return;
      }

      if (!API_ENABLED) {
        const remaining = state.students.filter((student) => student.id !== studentId);
        const draft = { ...state.attendanceDraft };
        delete draft[studentId];
        dispatch({
          type: 'SET_ROSTER',
          payload: {
            ...fallbackRoster,
            students: remaining,
          },
        });
        dispatch({ type: 'RESET_ATTENDANCE', payload: draft });
        toast.success('Õpilane arhiveeritud (demo)');
        return;
      }
      try {
        await apiRequest({
          action: 'removeStudent',
          payload: {
            rowIndex: studentId,
            coachId,
          },
        });
        toast.success('Õpilane arhiveeritud');
        await refreshRoster();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Õpilase eemaldamine ebaõnnestus');
      }
    },
    [API_ENABLED, coachId, refreshRoster, state.attendanceDraft, state.students],
  );

  const filteredStudents = useMemo(() => {
    if (!state.search) {
      return state.students;
    }
    const term = state.search.toLowerCase();
    return state.students.filter((student) =>
      [student.name, student.group].some((value) => value.toLowerCase().includes(term)),
    );
  }, [state.search, state.students]);

  const value = useMemo(
    () => ({
      students: state.students,
      filteredStudents,
      loading: state.loading,
      search: state.search,
      groups: state.groups,
      groupColors: state.groupColors,
      attendanceDraft: state.attendanceDraft,
      refreshRoster,
      setSearch,
      toggleAttendance,
      setAttendanceDraft,
      saveToday,
      addStudent,
      removeStudent,
    }),
    [
      state.students,
      filteredStudents,
      state.loading,
      state.search,
      state.groups,
      state.groupColors,
      state.attendanceDraft,
      refreshRoster,
      setSearch,
      toggleAttendance,
      setAttendanceDraft,
      saveToday,
      addStudent,
      removeStudent,
    ],
  );

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}

export function useRoster() {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster peab olema RosterProvideri sees');
  }
  return context;
}
