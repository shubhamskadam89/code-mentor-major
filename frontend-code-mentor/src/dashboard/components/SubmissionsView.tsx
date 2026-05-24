import { useState } from 'react'
import { Search, Code2, CheckCircle2, XCircle, Calendar, ShieldAlert, Loader2 } from 'lucide-react'
import { useAuth } from '../../modules/auth/context/AuthContext'
import { useSubmissions } from '../../shared/hooks/useSubmissions'

export function SubmissionsView() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('ALL');
    const [difficultyFilter, setDifficultyFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const { data: submissions = [], isLoading: loading, isError } = useSubmissions(user?.handle);
    const error = isError ? 'Unable to connect to the backend server. Please verify it is running on port 8080.' : null;

    // Filter submissions list based on search query and drop-down selectors
    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch = sub.problemId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = platformFilter === 'ALL' || sub.platform === platformFilter;
        const matchesDifficulty = difficultyFilter === 'ALL' || sub.difficulty.toUpperCase() === difficultyFilter.toUpperCase();
        const matchesStatus = statusFilter === 'ALL' || 
            (statusFilter === 'COMPLETED' && sub.completed) || 
            (statusFilter === 'IN_PROGRESS' && !sub.completed);

        return matchesSearch && matchesPlatform && matchesDifficulty && matchesStatus;
    });

    // Compute metrics
    const totalSubmissions = filteredSubmissions.length;
    const completedSubmissions = filteredSubmissions.filter(s => s.completed).length;
    const successRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0;
    const totalHintsUsed = filteredSubmissions.reduce((acc, curr) => acc + curr.hintsUsed, 0);

    const getPlatformBadge = (platformName: string) => {
        const p = platformName.toUpperCase();
        if (p === 'LEETCODE') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                    LeetCode
                </span>
            );
        }
        if (p === 'GEEKSFORGEEKS') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20">
                    GeeksForGeeks
                </span>
            );
        }
        if (p === 'HACKERRANK') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20">
                    HackerRank
                </span>
            );
        }
        if (p === 'CODECHEF') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20">
                    CodeChef
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                {platformName}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty: string) => {
        const diff = difficulty.toLowerCase();
        if (diff === 'easy') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/10">
                    Easy
                </span>
            );
        }
        if (diff === 'medium') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-500/10">
                    Medium
                </span>
            );
        }
        if (diff === 'hard') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-500/10">
                    Hard
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border border-zinc-500/10">
                {difficulty}
            </span>
        );
    };

    const getFormattedDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return dateStr;
        }
    };

    const formatProblemName = (problemId: string) => {
        return problemId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">My Submissions</h2>
                    <p className="text-zinc-500 font-medium tracking-wide">
                        View and analyze your extension-tracked programming challenges.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="font-medium">Loading your submissions...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm">
                    <ShieldAlert className="w-12 h-12 text-orange-500 mb-3" />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Server Connection Error</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">
                        {error}
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary metrics blocks */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Total Submissions</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-zinc-900 dark:text-white">{totalSubmissions}</span>
                                <span className="text-xs font-bold text-zinc-500">attempts</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Completed Challenges</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500">{completedSubmissions}</span>
                                <span className="text-xs font-bold text-zinc-500">problems</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Success Rate</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-blue-600 dark:text-blue-500">{successRate}%</span>
                                <span className="text-xs font-bold text-zinc-500">completed</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500"></div>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Total Hints Used</span>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-3xl font-black text-yellow-600 dark:text-yellow-500">{totalHintsUsed}</span>
                                <span className="text-xs font-bold text-zinc-500">hints</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter and search controls panel */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                            {/* Search box */}
                            <div className="flex-1 relative">
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by problem ID..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Filters row */}
                            <div className="grid grid-cols-3 gap-3 w-full xl:w-auto">
                                <div className="flex flex-col">
                                    <select
                                        value={platformFilter}
                                        onChange={e => setPlatformFilter(e.target.value)}
                                        className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        <option value="ALL">All Platforms</option>
                                        <option value="LEETCODE">LeetCode</option>
                                        <option value="GEEKSFORGEEKS">GeeksForGeeks</option>
                                        <option value="HACKERRANK">HackerRank</option>
                                        <option value="CODECHEF">CodeChef</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <select
                                        value={difficultyFilter}
                                        onChange={e => setDifficultyFilter(e.target.value)}
                                        className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        <option value="ALL">All Difficulties</option>
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submissions Table / Feed list */}
                    {filteredSubmissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <Code2 className="w-12 h-12 text-zinc-400 mb-3" />
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                                {submissions.length === 0 ? "No submissions found" : "No matching submissions"}
                            </h3>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                {submissions.length === 0 
                                    ? "You haven't made any submissions yet. Try solving some problems using the extension!" 
                                    : "Try adjusting your search query or filters to view submissions."}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase tracking-widest text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-bold">
                                            <th className="px-6 py-4">Problem Name / ID</th>
                                            <th className="px-6 py-4">Platform</th>
                                            <th className="px-6 py-4">Difficulty</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-center">Hints Used</th>
                                            <th className="px-6 py-4 text-right">Submitted At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-medium">
                                        {filteredSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-zinc-900 dark:text-white leading-tight">
                                                            {formatProblemName(sub.problemId)}
                                                        </span>
                                                        <span className="text-xs text-zinc-400 font-normal">
                                                            {sub.problemId}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPlatformBadge(sub.platform)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getDifficultyBadge(sub.difficulty)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {sub.completed ? (
                                                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-semibold text-orange-600 dark:text-orange-400 gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                                                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                                                            In Progress
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {sub.hintsUsed > 0 ? (
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-black">
                                                            {sub.hintsUsed}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-400 dark:text-zinc-600 text-xs">
                                                            None
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-500 flex items-center justify-end space-x-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{getFormattedDate(sub.timestamp)}</span>
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
    )
}
