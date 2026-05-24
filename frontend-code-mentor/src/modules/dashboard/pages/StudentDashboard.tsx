import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/context/AuthContext';
import { useStudentProfile } from '../../../shared/hooks/useStudentProfile';
import { useStudentAssignments } from '../../../shared/hooks/useAssignments';
import { useStudentClassrooms, useJoinClassroom } from '../../../shared/hooks/useClassrooms';
import { useSubmissions } from '../../../shared/hooks/useSubmissions';
import { useLeaderboard } from '../../../shared/hooks/useLeaderboard';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  UserPlus, 
  FileText, 
  History, 
  User, 
  ChevronRight, 
  ArrowRight,
  X,
  AlertCircle,
  RefreshCw,
  Award
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Data Fetching via React Query Hooks
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useStudentProfile(user?.handle);
  const { data: assignments, isLoading: isAssignmentsLoading, error: assignmentsError } = useStudentAssignments(user?.handle);
  const { data: classrooms, isLoading: isClassroomsLoading, error: classroomsError } = useStudentClassrooms(profile?.id);
  const { data: submissions, isLoading: isSubmissionsLoading, error: submissionsError } = useSubmissions(user?.handle);
  const { data: leaderboard, isLoading: isLeaderboardLoading, error: leaderboardError } = useLeaderboard(user?.handle);

  const joinMutation = useJoinClassroom(profile?.id || 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleJoinClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !profile?.id) return;
    
    joinMutation.mutate({ joinCode: joinCode.trim() }, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setShowJoinModal(false);
        setJoinCode('');
        alert("Enrolled in classroom successfully!");
      },
      onError: (err: any) => {
        alert(err.message || "Failed to join classroom. Verify the code and try again.");
      }
    });
  };

  // 2. Computed / Helper Methods
  const getUrgencyState = (dueDateStr: string, status: string): { urgency: 'completed' | 'soon' | 'overdue'; remainingText: string } => {
    if (status === 'completed') {
      return { urgency: 'completed', remainingText: 'Completed' };
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    if (dueDateStr.toLowerCase().includes('last week')) {
      return { urgency: 'overdue', remainingText: 'Overdue by several days' };
    }

    if (dueDateStr.toLowerCase().includes('tomorrow')) {
      return { urgency: 'soon', remainingText: 'Due tomorrow, 11:59 PM' };
    }

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (weekdays.some(day => dueDateStr.toLowerCase().includes(day))) {
      return { urgency: 'soon', remainingText: `Due this ${dueDateStr.split(',')[0]}` };
    }

    const parsed = Date.parse(`${dueDateStr}, ${currentYear}`);
    if (!isNaN(parsed)) {
      const dueDate = new Date(parsed);
      dueDate.setHours(23, 59, 59, 999);
      if (dueDate < now) {
        return { urgency: 'overdue', remainingText: 'Overdue' };
      } else {
        const diffTime = Math.abs(dueDate.getTime() - now.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { urgency: 'soon', remainingText: `Due in ${diffDays} days` };
      }
    }

    return { urgency: 'soon', remainingText: 'Pending assignment' };
  };

  const formatTimeAgo = (timestampStr: string): string => {
    if (!timestampStr) return '';
    const now = new Date();
    const date = new Date(timestampStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Loading indicator / skeletons
  const isAnyLoading = isProfileLoading || isAssignmentsLoading || isClassroomsLoading || isSubmissionsLoading || isLeaderboardLoading;
  const isAnyError = profileError || assignmentsError || classroomsError || submissionsError || leaderboardError;

  if (isAnyLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Profile Snapshot Skeleton */}
        <div className="bg-zinc-150 dark:bg-zinc-900 h-28 rounded-3xl w-full"></div>
        {/* Summary Strip Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-150 dark:bg-zinc-900 h-20 rounded-2xl"></div>
          <div className="bg-zinc-150 dark:bg-zinc-900 h-20 rounded-2xl"></div>
          <div className="bg-zinc-150 dark:bg-zinc-900 h-20 rounded-2xl"></div>
          <div className="bg-zinc-150 dark:bg-zinc-900 h-20 rounded-2xl"></div>
        </div>
        {/* Due Soon Section Skeleton */}
        <div className="bg-zinc-150 dark:bg-zinc-900 h-64 rounded-3xl w-full"></div>
      </div>
    );
  }

  // Safe Fallback defaults
  const studentProfile = profile || { name: user?.handle || 'Student', handle: user?.handle || 'student', prn: 'None', department: 'None' };
  const studentAssignments = assignments || [];
  const enrolledClassrooms = classrooms || [];
  const recentSubmissions = (submissions || []).slice(0, 5);

  // Derived Summary Strip details
  const activeClassroomsCount = enrolledClassrooms.length;
  const pendingAssignmentsCount = studentAssignments.filter(a => a.status !== 'completed').length;
  const completedAssignmentsCount = studentAssignments.filter(a => a.status === 'completed').length;
  const totalAssignmentsCount = studentAssignments.length;
  
  // Overall Progress
  const overallProgressPercentage = totalAssignmentsCount > 0 
    ? Math.round((completedAssignmentsCount / totalAssignmentsCount) * 100) 
    : 0;

  // Leaderboard statistics
  const userRankIndex = leaderboard ? leaderboard.findIndex(st => st.handle === user?.handle) : -1;
  const currentRank = userRankIndex !== -1 ? leaderboard![userRankIndex].rank : 0;
  const userLeaderboardData = userRankIndex !== -1 ? leaderboard![userRankIndex] : null;

  // Nearby students: immediately above and below in rank
  const nearbyStudents = [];
  if (leaderboard && userRankIndex !== -1) {
    if (userRankIndex > 0) {
      nearbyStudents.push(leaderboard[userRankIndex - 1]);
    }
    if (userRankIndex < leaderboard.length - 1) {
      nearbyStudents.push(leaderboard[userRankIndex + 1]);
    }
  }

  // Sorted assignments by urgency
  const sortedPendingAssignments = [...studentAssignments]
    .filter(a => a.status !== 'completed')
    .map(a => ({
      ...a,
      urgencyState: getUrgencyState(a.dueDate, a.status)
    }))
    .sort((a, b) => {
      // Overdue first, then soon, then future
      const priority: Record<string, number> = { overdue: 0, soon: 1, future: 2, completed: 3 };
      return priority[a.urgencyState.urgency] - priority[b.urgencyState.urgency];
    });

  return (
    <div className="space-y-8">
      {/* HEADER SECTION: Profile Snapshot & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Academic Workspace
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Track coding challenges, check deadlines, and enter classrooms.
          </p>
        </div>

        {/* SECTION 7: PROFILE SNAPSHOT */}
        <div className="flex items-center space-x-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl shadow-sm max-w-md w-full lg:w-auto shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-xl font-bold text-orange-655 shrink-0">
            {studentProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-zinc-900 dark:text-white truncate text-sm">{studentProfile.name}</h4>
            <div className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase truncate mt-0.5">
              PRN: {studentProfile.prn || 'Not Set'} • {studentProfile.department || 'General'}
            </div>
            
            {/* Linked platforms */}
            <div className="flex space-x-1.5 mt-1.5">
              {['LeetCode', 'CodeChef', 'GFG', 'HackerRank'].map((platform) => (
                <span key={platform} className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right pl-3 border-l border-zinc-150 dark:border-zinc-800 shrink-0">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Progress</div>
            <div className="font-black text-sm text-zinc-800 dark:text-zinc-200">{overallProgressPercentage}%</div>
            <div className="w-16 bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${overallProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {isAnyError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex items-center space-x-3 text-red-750 dark:text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Error loading some dashboard widgets. Make sure the backend is active.</span>
          <button 
            onClick={handleRefresh}
            className="ml-auto inline-flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-bold"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      )}

      {/* SECTION 1: TOP SUMMARY STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Classrooms</div>
            <div className="font-black text-2xl text-zinc-800 dark:text-zinc-100">{activeClassroomsCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pending</div>
            <div className="font-black text-2xl text-zinc-800 dark:text-zinc-100">{pendingAssignmentsCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Completed</div>
            <div className="font-black text-2xl text-zinc-800 dark:text-zinc-100">{completedAssignmentsCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Class Rank</div>
            <div className="font-black text-2xl text-zinc-800 dark:text-zinc-100">
              {currentRank ? `#${currentRank}` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DUE SOON (DOMINATING DOCK) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Assignments Queue</span>
          </h2>
          <span className="text-xs font-bold text-zinc-400">Ordered by Urgency</span>
        </div>

        {sortedPendingAssignments.length === 0 ? (
          <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-3xl p-10 text-center">
            <span className="text-3xl">🎉</span>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-200 mt-2">All tasks completed!</h4>
            <p className="text-xs text-zinc-400 mt-1">No pending classroom coding assignments left.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPendingAssignments.map((a) => {
              const { urgency, remainingText } = a.urgencyState;
              const solvedCount = a.problems?.filter((p: any) => p.completed).length || 0;
              const totalCount = a.problems?.length || 0;
              
              let borderClass = 'border-zinc-200 dark:border-zinc-800';
              let accentClass = 'bg-zinc-300 dark:bg-zinc-700';
              let badgeColor = 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400';
              
              if (urgency === 'overdue') {
                accentClass = 'bg-red-500';
                badgeColor = 'bg-red-50 text-red-650 dark:bg-red-950/25 dark:text-red-400';
              } else if (urgency === 'soon') {
                accentClass = 'bg-amber-500';
                badgeColor = 'bg-amber-50 text-amber-650 dark:bg-amber-950/25 dark:text-amber-400';
              }

              return (
                <div 
                  key={a.id} 
                  className={`bg-white dark:bg-zinc-900 border ${borderClass} rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full relative overflow-hidden`}
                >
                  {/* Visual Status Indicator strip */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${accentClass}`}></div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                          {a.title}
                        </h4>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          {a.course}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${badgeColor}`}>
                        {urgency === 'overdue' ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{remainingText}</span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {a.dueDate}
                      </span>
                    </div>

                    {/* Progress slider */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-zinc-400">PROBLEMS SOLVED</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{solvedCount}/{totalCount}</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${urgency === 'overdue' ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${a.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/student/assignments/${a.id}`)}
                    className="mt-5 w-full inline-flex items-center justify-center space-x-2 py-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black text-zinc-850 dark:text-zinc-100 transition"
                  >
                    <span>Continue Assignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: ACTIVE CLASSROOMS | RECENT SUBMISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Classrooms */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <span>Active Classrooms</span>
          </h3>

          {enrolledClassrooms.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center text-zinc-450">
              No classrooms enrolled. Enroll now via Quick Actions.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {enrolledClassrooms.map((c) => {
                // Compute pending count
                const classAssignments = studentAssignments.filter(a => a.course === c.name || a.classroomId === c.id);
                const classPendingCount = classAssignments.filter(a => a.status !== 'completed').length;
                
                // Get classroom recent activity from submissions
                const classSubmissions = (submissions || []).filter(sub => 
                  classAssignments.some(a => a.problems?.some((p: any) => p.problemId === sub.problemId))
                );
                const lastSub = classSubmissions[0];
                const recentActivity = lastSub 
                  ? `Solved "${lastSub.problemId.split('_').pop()}" ${formatTimeAgo(lastSub.timestamp)}` 
                  : "No recent submissions";

                return (
                  <div 
                    key={c.id} 
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                          {c.name}
                        </h4>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          {c.subjectName} • Sem {c.semester} Div {c.division}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-850">
                        {c.teacherName || 'Instructor'}
                      </span>
                    </div>

                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs font-bold text-zinc-500">
                      <div className="py-2 flex justify-between">
                        <span>Pending Assignments</span>
                        <span className={`font-black ${classPendingCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {classPendingCount} pending
                        </span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span>Class Active Status</span>
                        <span className="font-semibold text-zinc-400 truncate max-w-[200px]">
                          {recentActivity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/student/classrooms/${c.id}`)}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm"
                    >
                      Enter Classroom
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Submissions */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-orange-500" />
            <span>Recent Activity Feed</span>
          </h3>

          {recentSubmissions.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center text-zinc-450">
              No problem submission activity recorded yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 divide-y divide-zinc-150 dark:divide-zinc-800/80">
              {recentSubmissions.map((sub) => {
                // Find matching assignment if any
                const linkedAssignment = studentAssignments.find(a => 
                  a.problems?.some((p: any) => p.problemId === sub.problemId)
                );

                return (
                  <div key={sub.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm text-zinc-850 dark:text-zinc-100 truncate">
                        {sub.problemId.split('_').pop()}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-zinc-450 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 uppercase tracking-widest text-[8px]">
                          {sub.platform}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(sub.timestamp)}</span>
                      </div>
                      {linkedAssignment && (
                        <div className="text-[9px] font-bold text-zinc-400 mt-1 truncate">
                          Linked to: {linkedAssignment.title}
                        </div>
                      )}
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${
                      sub.completed 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {sub.completed ? 'Accepted' : 'Failed'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: RANKING PREVIEW | QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Rank Preview */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-orange-500" />
            <span>Leaderboard Preview</span>
          </h3>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                    Rank #{currentRank || 'N/A'} in Classroom
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                    Score: {userLeaderboardData?.score || 0} pts • {userLeaderboardData?.problems || 0} solved
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/student/leaderboard')}
                className="text-xs font-extrabold text-orange-500 hover:text-orange-600 transition flex items-center space-x-0.5"
              >
                <span>View Full Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score motivation message */}
            {nearbyStudents.length > 0 && userLeaderboardData && (
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-955/20 border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl">
                {nearbyStudents[0]?.rank < currentRank ? (
                  <span>
                    📈 You are only {nearbyStudents[0].score - userLeaderboardData.score} points behind {nearbyStudents[0].name} to level up!
                  </span>
                ) : (
                  <span>🔥 You are leading this segment of the classroom leaderboard! Keep it up.</span>
                )}
              </div>
            )}

            {/* Nearby students listing */}
            {leaderboard && leaderboard.length > 0 && (
              <div className="space-y-2">
                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Adjacent Competitors</div>
                {/* Take a tiny slice around user index */}
                {leaderboard.slice(Math.max(0, userRankIndex - 1), Math.min(leaderboard.length, userRankIndex + 2)).map((st) => {
                  const isMe = st.handle === user?.handle;
                  return (
                    <div 
                      key={st.handle}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                        isMe 
                          ? 'bg-orange-50/50 dark:bg-orange-550/10 text-orange-655' 
                          : 'text-zinc-600 dark:text-zinc-350'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-black w-6 text-center">#{st.rank}</span>
                        <span>{st.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{st.problems} solved</span>
                        <span className="font-extrabold">{st.score} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span>Quick Actions</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm hover:border-orange-500/40 hover:shadow-md transition flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="font-black text-xs text-zinc-800 dark:text-zinc-200">Join Classroom</span>
            </button>

            <button
              onClick={() => navigate('/student/assignments')}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm hover:border-orange-500/40 hover:shadow-md transition flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-black text-xs text-zinc-800 dark:text-zinc-200">Open Assignments</span>
            </button>

            <button
              onClick={() => navigate('/student/submissions')}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm hover:border-orange-500/40 hover:shadow-md transition flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <span className="font-black text-xs text-zinc-800 dark:text-zinc-200">View Submissions</span>
            </button>

            <button
              onClick={() => navigate('/student/profile')}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm hover:border-orange-500/40 hover:shadow-md transition flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <span className="font-black text-xs text-zinc-800 dark:text-zinc-200">Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* JOIN CLASSROOM POPUP MODAL (GLASSMORPHISM OVERLAY) */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-650 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">Join a Classroom</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-1">Enter the 6-character code provided by your instructor.</p>
            </div>
            <form onSubmit={handleJoinClassroomSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Classroom Join Code</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. A9B8C7"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 rounded-xl font-mono text-center text-lg font-black focus:ring-2 focus:ring-orange-500/50 outline-none uppercase tracking-wider text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                disabled={joinMutation.isPending || !joinCode.trim()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-extrabold transition shadow-md shadow-orange-500/10"
              >
                {joinMutation.isPending ? "Joining Class..." : "Enroll in Classroom"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
