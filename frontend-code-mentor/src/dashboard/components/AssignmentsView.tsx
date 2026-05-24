import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, RefreshCw, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useStudentAssignments } from '../../shared/hooks/useAssignments';
import { useQueryClient } from '@tanstack/react-query';
import { assignmentKeys } from '../../shared/hooks/useAssignments';

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

export function AssignmentsView() {
    const { user } = useAuth();
    const qc = useQueryClient();

    const { data: assignments = [], isLoading, isError, refetch } = useStudentAssignments(user?.handle);

    const handleRefresh = () => {
        if (user?.handle) {
            qc.invalidateQueries({ queryKey: assignmentKeys.byStudent(user.handle) });
        }
        refetch();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Class Assignments</h2>
                    <p className="text-zinc-500 font-medium tracking-wide">Track your coursework and upcoming deadlines.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="font-medium">Loading your assignments...</p>
                </div>
            ) : isError ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">Backend Connection Failed</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Unable to retrieve class assignments. Please ensure the backend is running on port 8080.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : (assignments as AssignmentItem[]).length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">
                        No active assignments found. Enrolling in a classroom will automatically load assignments here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(assignments as AssignmentItem[]).map(assignment => {
                        const problems = assignment.problems ?? [];
                        const completedCount = problems.filter(p => p.completed).length;

                        return (
                            <div
                                key={assignment.id}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group"
                            >
                                {/* Top Accent Bar */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-${assignment.color || 'orange'}-500 opacity-80 group-hover:opacity-100 transition-opacity`} />

                                <div className="flex items-start justify-between mb-4 mt-2">
                                    <div className="flex-1 overflow-hidden pr-2">
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1 truncate">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{assignment.course}</p>
                                    </div>
                                    {assignment.status === 'completed' ? (
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-full shrink-0">
                                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>Due: {assignment.dueDate}</span>
                                </div>

                                {/* Problem count badge */}
                                {problems.length > 0 && (
                                    <div className="mb-4 text-xs font-semibold text-zinc-500">
                                        {completedCount}/{problems.length} problems solved
                                        <div className="mt-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-orange-500 h-1.5 rounded-full transition-all"
                                                style={{ width: `${problems.length > 0 ? (completedCount / problems.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto">
                                    {assignment.status === 'completed' && assignment.score ? (
                                        <div className="flex justify-between items-center py-2 px-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 mb-3">
                                            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Final Score</span>
                                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{assignment.score}</span>
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm font-bold mb-1.5">
                                                <span className="text-zinc-700 dark:text-zinc-300">Progress</span>
                                                <span className="text-orange-500">{assignment.progress}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${assignment.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* View Details link — Stage 5 */}
                                    <Link
                                        to={`/student/assignments/${assignment.id}`}
                                        className="flex items-center justify-center w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-orange-500 dark:hover:bg-orange-500 text-zinc-600 dark:text-zinc-400 hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 rounded-xl text-sm font-bold transition-all group/link"
                                    >
                                        View Details
                                        <span className="ml-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
export default AssignmentsView;
