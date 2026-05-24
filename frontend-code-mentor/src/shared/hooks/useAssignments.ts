import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAssignmentsByTeacher,
  fetchAssignmentsByStudent,
  createAssignment,
  Assignment,
  AssignmentProblem,
} from '../../services/assignmentService';

// ── QUERY KEYS ────────────────────────────────────────────────────────────────
export const assignmentKeys = {
  all: ['assignments'] as const,
  byTeacher: (email: string) => [...assignmentKeys.all, 'teacher', email] as const,
  byStudent: (handle: string) => [...assignmentKeys.all, 'student', handle] as const,
  detail: (id: number | string) => [...assignmentKeys.all, 'detail', id] as const,
};

// ── TEACHER ASSIGNMENTS ───────────────────────────────────────────────────────
export function useTeacherAssignments(email: string | undefined) {
  return useQuery<Assignment[], Error>({
    queryKey: assignmentKeys.byTeacher(email ?? ''),
    queryFn: () => fetchAssignmentsByTeacher(email!),
    enabled: !!email,
    staleTime: 1000 * 60 * 2,
  });
}

// ── STUDENT ASSIGNMENTS ───────────────────────────────────────────────────────
export function useStudentAssignments(handle: string | undefined) {
  return useQuery<any[], Error>({
    queryKey: assignmentKeys.byStudent(handle ?? ''),
    queryFn: () => fetchAssignmentsByStudent(handle!),
    enabled: !!handle,
    staleTime: 1000 * 60,
  });
}

// ── CREATE ASSIGNMENT (teacher mutation) ──────────────────────────────────────
export function useCreateAssignment(teacherEmail: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      classroomId: number;
      title: string;
      description: string;
      category: string;
      totalMarks: number;
      dueDate: string;
      problems: AssignmentProblem[];
    }) => createAssignment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.byTeacher(teacherEmail) });
    },
  });
}
