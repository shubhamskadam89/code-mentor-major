import { useQuery } from '@tanstack/react-query';

const BASE_URL = 'http://localhost:8080/api/v1';

export interface SubmissionItem {
  id: number;
  studentHandle: string;
  platform: string;
  problemId: string;
  difficulty: string;
  hintsUsed: number;
  completed: boolean;
  timestamp: string;
}

async function fetchSubmissions(handle: string): Promise<SubmissionItem[]> {
  const response = await fetch(
    `${BASE_URL}/tracking/handle/${handle}?page=0&size=100`
  );
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`Failed to fetch submissions (status ${response.status})`);
  }
  const result = await response.json();
  if (result?.success && Array.isArray(result.data)) {
    return result.data;
  }
  throw new Error('Invalid response format from submissions endpoint');
}

// ── QUERY KEYS ────────────────────────────────────────────────────────────────
export const submissionKeys = {
  all: ['submissions'] as const,
  byHandle: (handle: string) => [...submissionKeys.all, handle] as const,
};

// ── STUDENT SUBMISSIONS ───────────────────────────────────────────────────────
export function useSubmissions(handle: string | undefined) {
  return useQuery<SubmissionItem[], Error>({
    queryKey: submissionKeys.byHandle(handle ?? ''),
    queryFn: () => fetchSubmissions(handle!),
    enabled: !!handle,
    staleTime: 1000 * 60, // 1 minute
  });
}
