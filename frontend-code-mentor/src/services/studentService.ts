const BASE_URL = 'http://localhost:8080/api/v1';

export interface StudentProfile {
  id: number;
  name: string;
  handle: string;
  prn: string;
  department: string;
  profilePictureUrl: string;
  rating?: number;
  joinedClassroomsCount?: number;
  solvedProblemsCount?: number;
  joinedClassroomNames?: string[];
}

export interface StudentStats {
  studentName: string;
  handle: string;
  totalActiveDays: number;
  maxStreak: number;
  currentStreak: number;
  classTestsTaken: number;
  avgTestScore: number;
  dsaStats: { name: string; value: number; color: string }[];
  fundamentalsStats: { name: string; value: number; color: string }[];
}

export interface RatingHistoryEntry {
  date: string;
  rating: number;
}

export async function fetchStudentProfile(handle: string): Promise<StudentProfile> {
  const response = await fetch(`${BASE_URL}/students/handle/${handle}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to load student profile");
}

export async function updateStudentProfile(handle: string, profileData: { name: string; prn: string; department: string; profilePictureUrl: string }): Promise<StudentProfile> {
  const response = await fetch(`${BASE_URL}/students/handle/${handle}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }
  const res = await response.json();
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || "Failed to save student profile");
}

export async function fetchStudentDashboardStats(handle: string): Promise<StudentStats> {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/stats/${handle}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats (status ${response.status})`);
    }
    const res = await response.json();

    // Backend returns the raw DashboardStatsResponse object directly (no success/data envelope).
    // Validate by checking a known required field.
    if (res && res.handle !== undefined) {
      return res as StudentStats;
    }
    // Fallback: try the wrapped format in case the backend is updated later
    if (res?.success && res?.data) {
      return res.data as StudentStats;
    }
    throw new Error('Unexpected response format from dashboard stats endpoint');
  } catch (err: any) {
    throw new Error(`Failed to load dashboard stats: ${err.message}`);
  }
}

export async function fetchStudentRatingHistory(handle: string): Promise<RatingHistoryEntry[]> {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/rating-history/${handle}`);
    if (!response.ok) {
      // Non-fatal: endpoint may not be implemented yet; return empty history
      console.warn(`Rating history endpoint returned ${response.status} for handle: ${handle}`);
      return [];
    }
    const res = await response.json();

    // Backend returns a raw array directly (no success/data envelope)
    if (Array.isArray(res)) {
      return res as RatingHistoryEntry[];
    }
    // Fallback: wrapped format
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    // Unexpected format — degrade gracefully
    return [];
  } catch (err) {
    console.warn('fetchStudentRatingHistory failed silently:', err);
    return [];
  }
}
