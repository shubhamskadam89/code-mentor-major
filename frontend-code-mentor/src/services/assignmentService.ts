import { API_V1_BASE_URL } from '../shared/config';

const BASE_URL = API_V1_BASE_URL;

export interface AssignmentProblem {
  platform: string;
  problemId: string;
  title: string;
  difficulty: string;
  problemUrl: string;
  points: number;
  problemOrder: number;
}

export interface Assignment {
  id: number;
  classroomId: number;
  classroomName: string;
  title: string;
  description: string;
  category: string;
  totalMarks: number;
  dueDate: string;
  problems: AssignmentProblem[];
}

export async function fetchAssignmentsByTeacher(email: string): Promise<Assignment[]> {
  const response = await fetch(`${BASE_URL}/assignments/teacher/email/${email}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch assignments: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load teacher assignments");
}

export async function fetchAssignmentsByStudent(handle: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/dashboard/assignments/${handle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch student assignments: ${response.statusText}`);
  }
  return await response.json();
}

export async function createAssignment(assignmentData: {
  classroomId: number;
  title: string;
  description: string;
  category: string;
  totalMarks: number;
  dueDate: string;
  problems: AssignmentProblem[];
}): Promise<Assignment> {
  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) {
    const errRes = await response.json();
    throw new Error(errRes.message || `Failed to create assignment: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to create assignment");
}
