import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClassroomsByTeacherEmail,
  fetchClassroomsByStudentId,
  createClassroom,
  joinClassroom,
  Classroom,
} from '../../services/classroomService';

// ── QUERY KEYS ────────────────────────────────────────────────────────────────
export const classroomKeys = {
  all: ['classrooms'] as const,
  byTeacher: (email: string) => [...classroomKeys.all, 'teacher', email] as const,
  byStudent: (studentId: number) => [...classroomKeys.all, 'student', studentId] as const,
};

// ── TEACHER CLASSROOMS ────────────────────────────────────────────────────────
export function useTeacherClassrooms(email: string | undefined) {
  return useQuery<Classroom[], Error>({
    queryKey: classroomKeys.byTeacher(email ?? ''),
    queryFn: () => fetchClassroomsByTeacherEmail(email!),
    enabled: !!email,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ── STUDENT CLASSROOMS ────────────────────────────────────────────────────────
export function useStudentClassrooms(studentId: number | undefined) {
  return useQuery<Classroom[], Error>({
    queryKey: classroomKeys.byStudent(studentId ?? 0),
    queryFn: () => fetchClassroomsByStudentId(studentId!),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
  });
}

// ── CREATE CLASSROOM (teacher mutation) ───────────────────────────────────────
export function useCreateClassroom(teacherEmail: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClassroom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classroomKeys.byTeacher(teacherEmail) });
    },
  });
}

// ── JOIN CLASSROOM (student mutation) ─────────────────────────────────────────
export function useJoinClassroom(studentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ joinCode }: { joinCode: string }) => joinClassroom(studentId, joinCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classroomKeys.byStudent(studentId) });
    },
  });
}
