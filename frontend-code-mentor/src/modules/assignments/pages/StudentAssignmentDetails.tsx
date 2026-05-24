import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { useStudentAssignments } from '../../../shared/hooks/useAssignments';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AssignmentProblem {
  problemId: string;
  platform: string;
  title: string;
  difficulty: string;
  completed: boolean;
  url?: string;
  problemUrl?: string;
  points?: number;
  problemOrder?: number;
}

interface AssignmentItem {
  id: number | string;
  title: string;
  course: string;
  dueDate: string;
  status: string;
  progress: number;
  color: string;
  score?: string;
  problems?: AssignmentProblem[];
}

const difficultyColor = (d: string) => {
  switch (d.toLowerCase()) {
    case 'easy': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
    case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
    default: return 'text-red-500 bg-red-50 dark:bg-red-500/10';
  }
};

const platformColor = (p: string) => {
  switch (p.toUpperCase()) {
    case 'LEETCODE': return 'text-yellow-600 dark:text-yellow-400';
    case 'GEEKSFORGEEKS': return 'text-green-600 dark:text-green-400';
    case 'CODECHEF': return 'text-amber-600 dark:text-amber-400';
    case 'HACKERRANK': return 'text-teal-600 dark:text-teal-400';
    default: return 'text-zinc-500';
  }
};

export function StudentAssignmentDetails() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const { data: assignments, isLoading, isError } = useStudentAssignments(user?.handle);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-500">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="font-medium">Loading assignment details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">Failed to load assignment</h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              Unable to retrieve assignment data. Please ensure the backend is running on port 8080.
            </p>
          </div>
        </div>
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-zinc-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </div>
    );
  }

  const assignment = (assignments as AssignmentItem[] | undefined)?.find(
    (a) => String(a.id) === assignmentId
  );

  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12">
          <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-zinc-700 dark:text-zinc-300 mb-2">Assignment not found</h3>
          <p className="text-zinc-500 text-sm mb-6">
            This assignment may have been removed or you may not have access to it.
          </p>
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const problems = assignment.problems ?? [];
  const completedCount = problems.filter((p) => p.completed).length;
  const totalPoints = problems.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const earnedPoints = problems
    .filter((p) => p.completed)
    .reduce((sum, p) => sum + (p.points ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back navigation */}
      <Link
        to="/student/assignments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-${assignment.color || 'orange'}-500`} />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mt-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {assignment.status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-100 dark:border-orange-500/20">
                  <Clock className="w-3 h-3" /> In Progress
                </span>
              )}
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{assignment.course}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
              {assignment.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>Due: {assignment.dueDate}</span>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="flex flex-col gap-3 min-w-[180px]">
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-orange-500">
                {completedCount}/{problems.length}
              </div>
              <div className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">Problems Solved</div>
            </div>
            {totalPoints > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-emerald-500">
                  {earnedPoints}/{totalPoints}
                </div>
                <div className="text-xs text-zinc-500 font-semibold mt-1 uppercase tracking-wider">Points Earned</div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {assignment.status !== 'completed' && problems.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className="text-orange-500">{assignment.progress}%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-700"
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
          </div>
        )}

        {assignment.status === 'completed' && assignment.score && (
          <div className="mt-6 flex items-center justify-between px-5 py-3.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">Final Score</span>
            <span className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">{assignment.score}</span>
          </div>
        )}
      </div>

      {/* Problems List */}
      <div>
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Assigned Problems
          <span className="ml-3 text-sm font-semibold text-zinc-400">({problems.length} total)</span>
        </h2>

        {problems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 font-medium">
            No problems have been added to this assignment yet.
          </div>
        ) : (
          <div className="space-y-3">
            {[...problems]
              .sort((a, b) => (a.problemOrder ?? 0) - (b.problemOrder ?? 0))
              .map((prob, idx) => {
                const href = prob.problemUrl || prob.url || '#';
                return (
                  <a
                    key={prob.problemId || idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      {/* Completion indicator */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        prob.completed
                          ? 'bg-emerald-50 dark:bg-emerald-500/10'
                          : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}>
                        {prob.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <span className="text-xs font-black text-zinc-500">{idx + 1}</span>
                        )}
                      </div>

                      {/* Problem info */}
                      <div className="overflow-hidden">
                        <div className="font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                          {prob.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs font-bold uppercase ${platformColor(prob.platform)}`}>
                            {prob.platform}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-600">·</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyColor(prob.difficulty)}`}>
                            {prob.difficulty}
                          </span>
                          {prob.points !== undefined && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-600">·</span>
                              <span className="text-xs font-extrabold text-orange-500">
                                {prob.points} pts
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right action */}
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {prob.completed && (
                        <span className="hidden sm:inline text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                          Solved ✓
                        </span>
                      )}
                      <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 group-hover:bg-orange-500 transition-colors">
                        <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </a>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
