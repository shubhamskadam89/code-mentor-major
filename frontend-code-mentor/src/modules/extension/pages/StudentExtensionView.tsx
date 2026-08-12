import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  BarChart3,
  Settings as SettingsIcon,
  ExternalLink,
  Clock,
  Target,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Flame,
  Calendar,
} from 'lucide-react';
import { useAuth, apiGet } from '../../../shared/hooks/useExtensionBridge';
import logoMark from '../../../assets/codementor-logo.svg';
import { appUrl } from '../../../shared/config';

// ─────────────────────────────────────────────
// Types (matching what the backend actually returns)
// ─────────────────────────────────────────────

interface DashboardStats {
  studentName: string;
  handle: string;
  totalActiveDays: number;
  maxStreak: number;
  currentStreak: number;
  classTestsTaken: number;
  avgTestScore: number;
  dsaStats: Array<{ name: string; value: number; color: string }>;
}

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: string;
  progress: number;
  problems: Array<{
    problemId: string;
    title: string;
    platform: string;
    difficulty: string;
    completed: boolean;
    url: string;
  }>;
}

type TabType = 'hints' | 'progress' | 'settings';

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function StudentExtensionView() {
  const { isAuth, token, email, handle, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('hints');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  void assignmentsLoading; // used to guard fetch; suppress lint

  // Hints — fetched from backend on demand
  const [hints, setHints] = useState<Array<{
    id: string;
    message: string;
    severity: string;
    level?: string;
    detailLevel?: string;
    reason?: string;
    nextAction?: string;
    hintDepth?: number;
    studentLevel?: string;
  }>>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const normalizeHints = useCallback((payload: any): Array<{
    id: string;
    message: string;
    severity: string;
    level?: string;
    detailLevel?: string;
    reason?: string;
    nextAction?: string;
    hintDepth?: number;
    studentLevel?: string;
  }> => {
    const rawHints = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.hints)
        ? payload.hints
        : Array.isArray(payload?.data?.hints)
          ? payload.data.hints
          : [];

    return rawHints.map((h: any, idx: number) => ({
      id: String(h?.id ?? idx),
      message: typeof h === 'string' ? h : h?.message ?? h?.text ?? JSON.stringify(h),
      severity: h?.severity ?? h?.level ?? 'medium',
      level: h?.level,
      detailLevel: h?.detailLevel,
      reason: h?.reason,
      nextAction: h?.nextAction,
      hintDepth: h?.hintDepth,
      studentLevel: h?.studentLevel,
    }));
  }, []);

  // ─── Data fetchers ─────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!handle || !token) return;
    setStatsLoading(true);
    const data = await apiGet<DashboardStats>(`/api/v1/dashboard/stats/${handle}`, token);
    setStats(data);
    setStatsLoading(false);
  }, [handle, token]);

  const fetchAssignments = useCallback(async () => {
    if (!handle || !token) return;
    setAssignmentsLoading(true);
    const data = await apiGet<Assignment[]>(`/api/v1/dashboard/assignments/${handle}`, token);
    setAssignments(data ?? []);
    setAssignmentsLoading(false);
  }, [handle, token]);

  useEffect(() => {
    if (isAuth) {
      fetchStats();
      fetchAssignments();
    }
  }, [isAuth, fetchStats, fetchAssignments]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;

    chrome.storage.local.get(['latestHints'], (result) => {
      const nextHints = normalizeHints(result.latestHints);
      if (nextHints.length > 0) {
        setHints(nextHints);
      }
    });

    const handleRuntimeMessage = (message: any) => {
      if (message?.type !== 'HINT_UPDATE') return;

      const nextHints = normalizeHints(message.data);
      setHintLoading(false);
      if (nextHints.length > 0) {
        setHints(nextHints);
        setHintError(null);
      } else {
        setHintError('No hint is available yet. Try editing your code and request again.');
      }
    };

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== 'local' || !changes.latestHints) return;

      const nextHints = normalizeHints(changes.latestHints.newValue);
      setHintLoading(false);
      if (nextHints.length > 0) {
        setHints(nextHints);
        setHintError(null);
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [normalizeHints]);

  // ─── Hint request ─────────────────────────────
  const handleRequestHint = async () => {
    if (!token) return;
    setHintLoading(true);
    setHintError(null);

    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      setHintLoading(false);
      setHintError('Extension messaging is unavailable. Reload the extension and try again.');
      return;
    }

    try {
      chrome.runtime.sendMessage({ type: 'REQUEST_HINT' }, (response) => {
        if (chrome.runtime.lastError || response?.error) {
          setHintLoading(false);
          setHintError('Could not reach the coding platform tab. Open LeetCode or GeeksforGeeks and try again.');
          return;
        }

        if (response && response.success === false) {
          setHintLoading(false);
          const capture = response.capture;
          if (capture?.hasEditor === false) {
            setHintError('I found the coding tab, but not the editor yet. Click inside the code editor and try again.');
          } else if (capture?.codeLength === 0) {
            setHintError('I found the editor, but it looks empty. Type or paste your solution code and try again.');
          } else {
            setHintError('The coding tab did not return code. Refresh the problem page and try again.');
          }
        }
      });

      window.setTimeout(() => {
        setHintLoading((stillLoading) => {
          if (stillLoading) {
            setHintError('No hint came back yet. Make sure the coding tab is active and your code editor has content.');
            return false;
          }
          return stillLoading;
        });
      }, 8000);
    } catch {
      setHintLoading(false);
      setHintError('Could not request a hint. Make sure you are on a coding platform page.');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Severity styles ─────────────────────────
  const getSeverityStyles = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          border: 'border-l-red-500',
          badge: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
          label: 'Critical',
        };
      case 'medium':
        return {
          border: 'border-l-amber-500',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
          label: 'Hint',
        };
      default:
        return {
          border: 'border-l-emerald-500',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
          label: 'Tip',
        };
    }
  };

  if (authLoading) {
    return (
      <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Unauthenticated ─────────────────────────
  if (!isAuth) {
    return (
      <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans p-6 text-center select-none">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-lg mb-4 animate-bounce">
          <img src={logoMark} alt="CodeMentor" className="w-full h-full rounded-2xl" />
        </div>
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Welcome to CodeMentor</h2>
        <p className="text-xs text-zinc-500 max-w-xs mt-2 leading-relaxed">
          You are signed out. Click the extension icon and click <strong>Sign In</strong> to continue.
        </p>
      </div>
    );
  }

  // ─── Derived stats ────────────────────────────
  const totalSolved  = stats ? (stats.dsaStats ?? []).reduce((s, d) => s + (d.value ?? 0), 0) : 0;
  const activeAssignment = assignments.find((a) => a.status === 'pending') ?? null;

  return (
    <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-extrabold shadow">
              <img src={logoMark} alt="CodeMentor" className="w-full h-full rounded-lg" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight">CodeMentor</h1>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Student Workspace</p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Active assignment banner */}
        {activeAssignment && (
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800/40 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs text-zinc-800 dark:text-zinc-200 min-w-0">
                <Target className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="truncate font-bold">{activeAssignment.title}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 text-[8px] font-black uppercase tracking-wider shrink-0">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="flex items-center space-x-1 font-semibold">
                <Calendar className="w-3 h-3" />
                <span>Due {activeAssignment.dueDate}</span>
              </span>
              <span className="font-bold">{activeAssignment.progress}% done</span>
            </div>
            <div className="w-full h-1 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${activeAssignment.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 shrink-0">
        {([
          { id: 'hints',    label: 'Hints',    icon: Lightbulb },
          { id: 'progress', label: 'Progress', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ] as const).map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 relative flex items-center justify-center space-x-1.5 py-3 px-3 text-xs font-bold transition-colors ${
                isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >

            {/* ──────── HINTS TAB ──────── */}
            {activeTab === 'hints' && (
              <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
                {/* Request bar */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-2 shadow-sm shrink-0">
                  <button
                    onClick={handleRequestHint}
                    disabled={hintLoading}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm ${
                      hintLoading
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-wait'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${hintLoading ? 'animate-spin' : ''}`} />
                    <span>{hintLoading ? 'Analyzing...' : hints.length > 0 ? 'Need Stronger Hint?' : 'Request AI Hint'}</span>
                  </button>

                  <a
                    href={appUrl('student/dashboard')}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl transition bg-zinc-50/50 dark:bg-zinc-900/30"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Hints list */}
                <div className="flex-1 p-4 space-y-4">
                  {hintLoading && (
                    <div className="space-y-3 animate-pulse">
                      <div className="bg-zinc-100 dark:bg-zinc-900 h-20 rounded-2xl w-full" />
                      <div className="bg-zinc-100 dark:bg-zinc-900 h-16 rounded-2xl w-full" />
                    </div>
                  )}

                  {hintError && !hintLoading && (
                    <div className="py-6 flex flex-col items-center text-center space-y-2">
                      <AlertCircle className="w-10 h-10 text-red-400" />
                      <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">{hintError}</p>
                    </div>
                  )}

                  {!hintLoading && !hintError && hints.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-14 h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                        💡
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">Assistant Idle</h4>
                        <p className="text-[10px] text-zinc-400 max-w-xs px-6 font-medium leading-relaxed">
                          Start typing your solution on LeetCode or GeeksforGeeks, then click <strong>Request AI Hint</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {!hintLoading && hints.length > 0 && (
                    <div className="space-y-3">
                      {hints.map((hint) => {
                        const styles = getSeverityStyles(hint.severity);
                        return (
                          <div
                            key={hint.id}
                            className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-sm rounded-2xl border-l-4 ${styles.border} p-4 flex flex-col space-y-2`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${styles.badge}`}>
                                {hint.level ?? styles.label}
                              </span>
                              <button
                                onClick={() => handleCopy(hint.id, hint.message)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg transition"
                              >
                                {copiedId === hint.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                              {hint.message}
                            </p>
                            {(hint.detailLevel || hint.studentLevel || hint.hintDepth) && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {hint.detailLevel && (
                                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider text-zinc-500">
                                    {hint.detailLevel} detail
                                  </span>
                                )}
                                {hint.studentLevel && (
                                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider text-zinc-500">
                                    {hint.studentLevel}
                                  </span>
                                )}
                                {hint.hintDepth && (
                                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[8px] font-black uppercase tracking-wider text-zinc-500">
                                    depth {hint.hintDepth}
                                  </span>
                                )}
                              </div>
                            )}
                            {hint.nextAction && (
                              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                                Next: {hint.nextAction}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ──────── PROGRESS TAB ──────── */}
            {activeTab === 'progress' && (
              <div className="p-4 space-y-5 bg-zinc-50 dark:bg-zinc-950 min-h-full">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Solved</span>
                        <span className="text-base font-black mt-0.5 block">{totalSolved}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">problems total</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>Streak</span>
                        </span>
                        <span className="text-base font-black mt-0.5 block">{stats?.currentStreak ?? 0}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">max: {stats?.maxStreak ?? 0} days</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Active Days</span>
                        <span className="text-base font-black mt-0.5 block">{stats?.totalActiveDays ?? 0}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">days coding</span>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-sm">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          <span>Avg Score</span>
                        </span>
                        <span className="text-base font-black mt-0.5 block">{stats?.avgTestScore ?? 0}%</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">{stats?.classTestsTaken ?? 0} tests</span>
                      </div>
                    </div>

                    {/* DSA breakdown */}
                    {stats?.dsaStats && stats.dsaStats.some((d) => d.value > 0) && (
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl shadow-sm space-y-2.5">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">DSA Progress</h3>
                        {stats.dsaStats.map((stat) => (
                          <div key={stat.name} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span>{stat.name}</span>
                              <span>{stat.value} solved</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, (stat.value / Math.max(1, totalSolved)) * 100)}%`,
                                  backgroundColor: stat.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Active assignments */}
                    {assignments.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assignments</h3>
                        {assignments.slice(0, 3).map((a) => (
                          <div
                            key={a.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold truncate">{a.title}</h4>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                                a.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {a.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-zinc-500 font-semibold">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{a.dueDate}</span>
                              </span>
                              <span>{a.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!statsLoading && !stats && (
                      <p className="text-center text-xs text-zinc-400 italic py-8">No stats yet. Start solving problems!</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ──────── SETTINGS TAB ──────── */}
            {activeTab === 'settings' && (
              <div className="p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950 min-h-full">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account</h3>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{handle}</p>
                    <p className="text-[10px] text-zinc-400">{email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 rounded-xl text-xs font-bold transition"
                  >
                    <span>Log Out of CodeMentor</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Links</h3>
                  <div className="space-y-2">
                    <a
                      href={appUrl('student/dashboard')}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-orange-500 transition"
                    >
                      <span>Full Dashboard</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={appUrl('student/assignments')}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-orange-500 transition"
                    >
                      <span>My Assignments</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold text-zinc-400 flex items-center justify-between shrink-0">
        <span>v1.0.0</span>
        <a
          href={appUrl('student/dashboard')}
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center space-x-1"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
