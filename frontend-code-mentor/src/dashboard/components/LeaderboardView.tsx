import { useAuth } from '../../modules/auth/context/AuthContext';
import { useLeaderboard, leaderboardKeys } from '../../shared/hooks/useLeaderboard';
import { useQueryClient } from '@tanstack/react-query';
import { Trophy, Medal, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export function LeaderboardView() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const { data: students = [], isLoading, isError, refetch } = useLeaderboard(user?.handle);

    const handleRefresh = () => {
        if (user?.handle) {
            qc.invalidateQueries({ queryKey: leaderboardKeys.byHandle(user.handle) });
        }
        refetch();
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" fill="currentColor" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-zinc-400" fill="currentColor" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" fill="currentColor" />;
        return <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400 w-6 text-center">{rank}</span>;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Class Leaderboard</h2>
                    <p className="text-zinc-500 font-medium tracking-wide font-sans">
                        Rankings based on completed assignment problems
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition disabled:opacity-50"
                    title="Refresh leaderboard"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="font-medium">Loading rankings...</p>
                </div>
            ) : isError ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-900 dark:text-red-300 mb-1">Failed to load leaderboard</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Unable to fetch class rankings. Please ensure the backend is running on port 8080.
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : students.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
                    <Trophy className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">
                        No leaderboard entries found. Enrolled classrooms will automatically show standings here.
                    </p>
                </div>
            ) : (
                <>
                    {/* Podium — Top 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">
                        {/* 2nd Place */}
                        {students.length > 1 ? (
                            <div className="order-2 md:order-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-black mb-4 relative ring-2 ring-zinc-200 dark:ring-zinc-700 select-none text-zinc-700 dark:text-zinc-300">
                                    {students[1].name.charAt(0).toUpperCase()}
                                    <div className="absolute -top-2 -right-2">{getRankIcon(2)}</div>
                                </div>
                                <h3 className="font-bold text-lg">{students[1].name}</h3>
                                <p className="text-xs text-zinc-500 mb-3">PRN: {students[1].prn}</p>
                                <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-extrabold text-sm mb-2 text-zinc-700 dark:text-zinc-300">
                                    {students[1].score} pts
                                </div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                                    ★ {students[1].rating}
                                </div>
                            </div>
                        ) : (
                            <div className="order-2 md:order-1 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex items-center justify-center text-zinc-400 min-h-[200px]">
                                No 2nd Place yet
                            </div>
                        )}

                        {/* 1st Place */}
                        {students.length > 0 ? (
                            <div className="order-1 md:order-2 bg-gradient-to-b from-orange-50 to-white dark:from-orange-500/10 dark:to-zinc-900 border-2 border-orange-200 dark:border-orange-500/30 rounded-2xl p-6 shadow-md flex flex-col items-center text-center transform md:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-400 to-yellow-400" />
                                <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-2xl font-black mb-4 relative ring-4 ring-white dark:ring-zinc-900 text-orange-600 select-none">
                                    {students[0].name.charAt(0).toUpperCase()}
                                    <div className="absolute -top-3 -right-3 drop-shadow-md">{getRankIcon(1)}</div>
                                </div>
                                <h3 className="font-extrabold text-xl">{students[0].name}</h3>
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mb-4">PRN: {students[0].prn}</p>
                                <div className="px-5 py-2 bg-orange-500 text-white rounded-full font-extrabold shadow-sm mb-2 text-sm">
                                    {students[0].score} pts
                                </div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                                    ★ {students[0].rating}
                                </div>
                            </div>
                        ) : (
                            <div className="order-1 md:order-2 bg-white dark:bg-zinc-900/50 border border-dashed border-orange-200 dark:border-orange-800 rounded-2xl p-6 flex items-center justify-center text-zinc-400 min-h-[240px]">
                                No 1st Place yet
                            </div>
                        )}

                        {/* 3rd Place */}
                        {students.length > 2 ? (
                            <div className="order-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-2">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-black mb-4 relative ring-2 ring-zinc-200 dark:ring-zinc-700 select-none text-zinc-700 dark:text-zinc-300">
                                    {students[2].name.charAt(0).toUpperCase()}
                                    <div className="absolute -top-2 -right-2">{getRankIcon(3)}</div>
                                </div>
                                <h3 className="font-bold text-lg">{students[2].name}</h3>
                                <p className="text-xs text-zinc-500 mb-3">PRN: {students[2].prn}</p>
                                <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-extrabold text-sm mb-2 text-zinc-700 dark:text-zinc-300">
                                    {students[2].score} pts
                                </div>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                                    ★ {students[2].rating}
                                </div>
                            </div>
                        ) : (
                            <div className="order-3 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex items-center justify-center text-zinc-400 min-h-[200px]">
                                No 3rd Place yet
                            </div>
                        )}
                    </div>

                    {/* Academic Rankings Table */}
                    {students.length > 3 && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-extrabold text-zinc-800 dark:text-zinc-200 tracking-tight">All Rankings</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                                            <th className="px-6 py-4 font-bold w-20 text-center">Rank</th>
                                            <th className="px-6 py-4 font-bold">Student</th>
                                            <th className="px-6 py-4 font-bold text-right">PRN</th>
                                            <th className="px-6 py-4 font-bold text-right">Rating</th>
                                            <th className="px-6 py-4 font-bold text-right">Score</th>
                                            <th className="px-6 py-4 font-bold text-right">Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {students.slice(3).map((student) => (
                                            <tr
                                                key={student.rank}
                                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-zinc-500 font-bold">{student.rank}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-zinc-700 dark:text-zinc-300 select-none">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-zinc-900 dark:text-white">
                                                            {student.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-mono text-zinc-500">{student.prn}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 text-xs">
                                                        ★ {student.rating}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-extrabold text-orange-600 dark:text-orange-400">
                                                        {student.score}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-zinc-600 dark:text-zinc-400">
                                                        {student.problems}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
