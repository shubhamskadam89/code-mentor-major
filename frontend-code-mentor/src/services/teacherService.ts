import { API_V1_BASE_URL } from '../shared/config';

const BASE_URL = API_V1_BASE_URL;

export interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  department: string;
  college: string;
  designation: string;
  profilePictureUrl: string;
}

export interface StudentRosterItem {
  id: number;
  name: string;
  handle: string;
  prn: string;
  department: string;
  rating: number;
  classrooms?: string[];
  totalHintsUsed?: number;
  strugglingProblems?: number;
  activeProblems?: number;
  needsAttention?: boolean;
}

export async function fetchTeacherProfile(email: string): Promise<TeacherProfile> {
  const response = await fetch(`${BASE_URL}/teachers/email/${email}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch teacher profile: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load instructor profile");
}

export async function updateTeacherProfile(email: string, profileData: { name: string; email: string; department: string; college: string; designation: string; profilePictureUrl: string }): Promise<TeacherProfile> {
  const response = await fetch(`${BASE_URL}/teachers/email/${email}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update teacher profile: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to save instructor profile");
}

export async function fetchTeacherStudentRoster(email: string): Promise<StudentRosterItem[]> {
  const response = await fetch(`${BASE_URL}/teachers/students/email/${email}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch students: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load students");
}

export interface TeacherDashboardSummary {
  classroomsCount: number;
  assignmentsCount: number;
  activeAssignmentsCount: number;
  pendingSubmissionsCount: number;
  activeTodayCount: number;
  strugglingStudentsCount: number;
  averageSolveRate: number;
  latestAssignment: {
    title: string;
    dueDate: string;
    progress: number;
    completedCount: number;
    totalStudents: number;
  } | null;
  activities: Array<{
    id: number;
    student: string;
    handle: string;
    action: string;
    time: string;
  }>;
  alerts: Array<{
    id: number;
    type: 'warning' | 'error' | 'info';
    text: string;
  }>;
}

export async function fetchTeacherDashboardSummary(email: string): Promise<TeacherDashboardSummary> {
  const response = await fetch(`${BASE_URL}/dashboard/teacher/summary?email=${email}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch teacher dashboard summary: ${response.statusText}`);
  }
  return await response.json();
}
