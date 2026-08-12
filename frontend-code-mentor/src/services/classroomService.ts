import { API_V1_BASE_URL } from '../shared/config';

const BASE_URL = API_V1_BASE_URL;

export interface Classroom {
  id: number;
  name: string;
  subjectName: string;
  semester: string;
  division: string;
  joinCode: string;
  studentCount: number;
  activeAssignmentCount: number;
  isArchived: boolean;
  teacherName?: string;
}

export async function fetchClassroomsByTeacherEmail(email: string): Promise<Classroom[]> {
  const response = await fetch(`${BASE_URL}/classrooms/teacher/email/${email}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch classrooms: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load classrooms");
}

export async function fetchClassroomsByStudentId(studentId: number): Promise<Classroom[]> {
  const response = await fetch(`${BASE_URL}/classrooms/student/${studentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch student classrooms: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load student classrooms");
}

export async function createClassroom(classroomData: {
  name: string;
  subjectName: string;
  semester: string;
  division: string;
  teacherId: number;
}): Promise<Classroom> {
  const response = await fetch(`${BASE_URL}/classrooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classroomData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create classroom: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to create classroom");
}

export async function joinClassroom(studentId: number, joinCode: string): Promise<Classroom> {
  const response = await fetch(`${BASE_URL}/classrooms/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, joinCode }),
  });
  if (!response.ok) {
    const errRes = await response.json();
    throw new Error(errRes.message || `Failed to join classroom: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to join classroom");
}
