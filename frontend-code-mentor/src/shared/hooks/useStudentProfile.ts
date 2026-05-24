import { useQuery } from '@tanstack/react-query';
import { fetchStudentProfile, StudentProfile } from '../../services/studentService';

export const profileKeys = {
  all: ['profile'] as const,
  byHandle: (handle: string) => [...profileKeys.all, handle] as const,
};

export function useStudentProfile(handle: string | undefined) {
  return useQuery<StudentProfile, Error>({
    queryKey: profileKeys.byHandle(handle ?? ''),
    queryFn: () => fetchStudentProfile(handle!),
    enabled: !!handle,
    staleTime: 1000 * 60 * 5, // Cache profile for 5 minutes
  });
}
