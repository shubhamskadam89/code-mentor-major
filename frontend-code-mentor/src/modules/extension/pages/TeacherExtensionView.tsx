import { useState, useEffect } from 'react';
import {
  Building,
  BookOpen,
  AlertTriangle,
  Users,
  ExternalLink,
  PlusCircle,
  Copy,
  Megaphone,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useExtensionBridge';

export function TeacherExtensionView() {
  const { isAuth, email, logout, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSummary = async () => {
    if (!email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/dashboard/teacher/summary?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to load teacher extension summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (email) {
      loadSummary();
    } else {
      setLoading(false);
    }
  }, [authLoading, email]);

  const handleCopyCode = () => {
    showToast('Open the full dashboard to copy a classroom code.');
  };

  const handlePublishAnnouncement = () => {
    showToast('Open the full dashboard to publish announcements.');
  };

  if (authLoading) {
    return (
      <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans p-6 text-center select-none">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-lg mb-4 animate-bounce">
          🎓
        </div>
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Welcome to CodeMentor</h2>
        <p className="text-xs text-zinc-405 dark:text-zinc-500 max-w-xs mt-2 leading-relaxed">
          You are currently signed out. Please click the CodeMentor extension icon in your browser toolbar and click <strong>Sign In</strong> to authorize.
        </p>
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const classroomsCount = summary ? summary.classroomsCount : 0;
  const assignmentsCount = summary ? summary.assignmentsCount : 0;
  const pendingSubmissions = summary ? summary.pendingSubmissionsCount : 0;
  const activeToday = summary ? summary.activeTodayCount : 0;
  const activities = summary ? summary.activities : [];
  const alerts = summary ? summary.alerts : [];
  const latestAssignment = summary ? summary.latestAssignment : null;

  return (
    <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans text-zinc-900 dark:text-zinc-150 overflow-hidden relative">
      <header className="p-4 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold shadow">
            🎓
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">CodeMentor</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Teacher Workspace</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadSummary}
            disabled={loading}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg transition"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* SNAPSHOT */}
        <section className="space-y-2">
          <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Classroom Snapshot</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Classrooms</span>
                <span className="text-base font-black mt-0.5 block">{classroomsCount}</span>
              </div>
              <Building className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Active Tasks</span>
                <span className="text-base font-black mt-0.5 block">{assignmentsCount}</span>
              </div>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider block">Pending</span>
                <span className="text-base font-black mt-0.5 block">{pendingSubmissions}</span>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Active Today</span>
                <span className="text-base font-black mt-0.5 block">{activeToday}</span>
              </div>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </section>

        {/* FEED */}
        <section className="space-y-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live Classroom Feed</h3>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2 max-h-[140px] overflow-y-auto shadow-sm">
            {activities.length > 0 ? (
              activities.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800/50 pb-2 last:border-b-0 last:pb-0">
                  <div className="min-w-0 truncate pr-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{act.student}</span>
                    <span className="text-zinc-400 ml-1.5 font-medium">{act.action}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 shrink-0 font-bold">{act.time}</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-zinc-450 italic text-center py-4">No classroom activity captured today.</p>
            )}
          </div>
        </section>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Alerts Panel</h3>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {alerts.map((alert: any) => (
                <div key={alert.id} className={`p-2.5 border rounded-xl flex items-start space-x-2 text-[11px] font-semibold ${
                  alert.type === 'error'
                    ? 'bg-red-50/20 dark:bg-red-955/10 border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400'
                    : alert.type === 'warning'
                    ? 'bg-amber-50/20 dark:bg-amber-955/10 border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'bg-blue-50/20 dark:bg-blue-955/10 border-blue-100 dark:border-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{alert.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LATEST TASK */}
        {latestAssignment && (
          <section className="space-y-2">
            <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Active Task Progress</h3>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-2.5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div>
                <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{latestAssignment.title}</h4>
                <p className="text-[9px] text-zinc-400 mt-0.5 font-semibold">Due: {latestAssignment.dueDate}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-extrabold text-zinc-450 uppercase tracking-wide">
                  <span>Class Solve Rate</span>
                  <span>{latestAssignment.progress}% ({latestAssignment.completedCount}/{latestAssignment.totalStudents} students)</span>
                </div>
                <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${latestAssignment.progress}%` }}></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ACTIONS */}
        <section className="space-y-2 pb-2">
          <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="http://localhost:3000/#/teacher/assignments"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl font-bold transition text-left text-zinc-700 dark:text-zinc-300 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>New Assignment</span>
            </a>
            <a
              href="http://localhost:3000/#/teacher/classrooms"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl font-bold transition text-left text-zinc-700 dark:text-zinc-300 shadow-sm"
            >
              <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Classrooms</span>
            </a>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl font-bold transition text-left text-zinc-700 dark:text-zinc-300 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Copy Code</span>
            </button>
            <button
              onClick={handlePublishAnnouncement}
              className="flex items-center space-x-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl font-bold transition text-left text-zinc-700 dark:text-zinc-300 shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Publish Alert</span>
            </button>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold text-zinc-400 flex items-center justify-between shrink-0">
        <span>Instructor Session</span>
        <a
          href="http://localhost:3000/#/teacher/dashboard"
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center space-x-1"
        >
          <span>Open Main Platform</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {toast && (
        <div className="absolute bottom-4 left-4 right-4 p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-between text-xs font-bold shadow-lg z-50">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
