export type CoachId = 1 | 2;

export interface Student {
  id: number; // rowIndex from sheet
  name: string;
  birthYear: number;
  group: string;
  attended: number;
  sessions: number;
  percentage: number;
  attendance: Record<string, 'P' | ''>;
}

export interface GroupColorMap {
  [group: string]: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface RosterPayload {
  students: Student[];
  groups: string[];
  groupColors: GroupColorMap;
  minBirthYear: number;
  maxBirthYear: number;
}
