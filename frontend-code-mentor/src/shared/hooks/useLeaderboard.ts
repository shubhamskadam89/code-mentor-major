import { useQuery } from '@tanstack/react-query';
import { API_V1_BASE_URL } from '../config';

const BASE_URL = API_V1_BASE_URL;

export interface StudentRank {
  rank: number;
  name: string;
  handle: string;
  prn: string;
  rating: number;
  score: number;
  problems: number;
  avatar?: string;
  trend?: string;
}

async function fetchLeaderboard(handle: string): Promise<StudentRank[]> {
  const response = await fetch(`${BASE_URL}/dashboard/leaderboard/${handle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard (status ${response.status})`);
  }
  const data = await response.json();
  if (Array.isArray(data)) return data;
  throw new Error('Invalid leaderboard response format');
}

// ── QUERY KEYS ────────────────────────────────────────────────────────────────
export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  byHandle: (handle: string) => [...leaderboardKeys.all, handle] as const,
};

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
export function useLeaderboard(handle: string | undefined) {
  return useQuery<StudentRank[], Error>({
    queryKey: leaderboardKeys.byHandle(handle ?? ''),
    queryFn: () => fetchLeaderboard(handle!),
    enabled: !!handle,
    staleTime: 1000 * 60 * 3, // 3 minutes – leaderboard changes less often
  });
}
