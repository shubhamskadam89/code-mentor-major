import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ExternalLink,
  Target,
  Layout,
  UserCheck
} from 'lucide-react';
import logoMark from '../assets/codementor-logo.svg';
import navbarDark from '../assets/codementor-navbar-dark.svg';
import { apiPath, appUrl } from '../shared/config';

interface AssignmentContext {
  title: string;
  course: string;
  dueDate: string;
  problemsSolved: number;
  totalProblems: number;
  status: string;
}

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeAssignmentContext, setActiveAssignmentContext] = useState<AssignmentContext | null>(null);

  // Load auth state from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get([
      'codementor_token',
      'codementor_handle',
      'codementor_email',
      'user_role',
      'activeAssignmentContext'
    ], (result) => {
      setIsAuth(!!result.codementor_token);
      if (result.user_role) setRole(result.user_role);
      if (result.codementor_handle) setHandle(result.codementor_handle);
      if (result.activeAssignmentContext) setActiveAssignmentContext(result.activeAssignmentContext);
      setLoading(false);
    });

    // Listen to updates from other scripts (like contentSync logging in/out)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.codementor_token) {
        setIsAuth(!!changes.codementor_token.newValue);
      }
      if (changes.user_role) {
        setRole(changes.user_role.newValue || 'student');
      }
      if (changes.codementor_handle) {
        setHandle(changes.codementor_handle.newValue || '');
      }
      if (changes.activeAssignmentContext) {
        setActiveAssignmentContext(changes.activeAssignmentContext.newValue || null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleSignInRedirect = () => {
    chrome.tabs.create({ url: appUrl() });
  };

  const handleOpenSidepanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.sidePanel.open({ tabId: activeTab.id }).catch((err) => {
          console.error('Failed to open sidepanel:', err);
          // Fallback message
          alert('To toggle sidepanel, please verify active tab permissions.');
        });
      }
    });
  };

  const handleLogout = async () => {
    try {
      // Call backend logout
      await fetch(apiPath('auth/logout'), { method: 'POST' }).catch(() => { });
    } catch { }

    chrome.storage.local.remove([
      'codementor_token',
      'codementor_handle',
      'codementor_email',
      'currentProblem',
      'activeAssignmentContext',
      'latestHints'
    ], () => {
      setIsAuth(false);
      setHandle('');

      setActiveAssignmentContext(null);
    });
  };

  if (loading) {
    return (
      <div className="w-[360px] h-[500px] bg-zinc-950 flex items-center justify-center border border-zinc-800 rounded-xl">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Unauthenticated Launcher View
  if (!isAuth) {
    return (
      <div className="w-[360px] h-[500px] bg-zinc-950 text-white flex flex-col items-center justify-between p-6 border border-zinc-800 rounded-xl relative overflow-hidden font-sans select-none">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo and Intro */}
        <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-orange-500/20">
            <img src={logoMark} alt="CodeMentor" className="w-full h-full rounded-2xl" />
          </div>
          <div className="text-center space-y-2">
            <img src={navbarDark} alt="CodeMentor" className="h-9 w-auto mx-auto" />
            <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mx-auto">
              Accelerate your coding capabilities on LeetCode & GeeksforGeeks with real-time AI mentoring.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="w-full space-y-2">
          <button
            onClick={handleSignInRedirect}
            className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 rounded-xl font-bold transition active:scale-[0.98] shadow-md flex items-center justify-center space-x-2 text-sm"
          >
            <span>Sign In to Continue</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <div className="text-center">
            <a
              href={appUrl('privacy-policy')}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Launcher View
  const isStudent = role === 'student';

  return (
    <div className="w-[360px] h-[500px] bg-zinc-950 text-white flex flex-col border border-zinc-850 rounded-xl relative overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="p-4 border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-2.5">
          <img src={logoMark} alt="CodeMentor" className="w-7 h-7 rounded-lg shadow-md" />
          <div>
            <h2 className="text-xs font-black tracking-tight">CodeMentor Companion</h2>
            <p className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider">
              {role} (@{handle})
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-10">
        {/* Primary Action Button */}
        <div className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-850 rounded-2xl flex flex-col space-y-3 shadow-md relative overflow-hidden">
          {/* Subtle overlay accent */}
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-10 ${isStudent ? 'bg-orange-500' : 'bg-blue-500'
            }`}></div>

          <div>
            <h3 className="font-extrabold text-xs">Coding Assistant Workspace</h3>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              Open the viewport side panel directly to get AI logic hints, performance scoring, and streak tracking.
            </p>
          </div>
          <button
            onClick={handleOpenSidepanel}
            className={`w-full py-2.5 rounded-xl text-xs font-extrabold shadow flex items-center justify-center space-x-1.5 text-white transition active:scale-95 ${isStudent ? 'bg-orange-550 hover:bg-orange-600' : 'bg-blue-650 hover:bg-blue-700'
              }`}
          >
            <Layout className="w-4 h-4" />
            <span>Open Sidepanel</span>
          </button>
        </div>

        {/* Sync / Context Area */}
        {isStudent && activeAssignmentContext && (
          <div className="p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-orange-500" />
              <span>Current Task</span>
            </div>
            <div>
              <h4 className="font-bold text-xs truncate text-zinc-100">{activeAssignmentContext.title}</h4>
              <p className="text-[9px] text-zinc-500 mt-0.5 font-semibold">Course: {activeAssignmentContext.course}</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-450">
                <span>Progress</span>
                <span>{activeAssignmentContext.problemsSolved} / {activeAssignmentContext.totalProblems} Solved</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${(activeAssignmentContext.problemsSolved / activeAssignmentContext.totalProblems) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Status Badge */}
        <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 font-semibold">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Companion Status</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
            Active Sync
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-3 bg-zinc-900/30 border-t border-zinc-900 text-[9px] font-bold text-zinc-500 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <span>v1.0.0</span>
          <span>•</span>
          <a
            href={appUrl('privacy-policy')}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
        <a
          href={appUrl(`${role}/dashboard`)}
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-300 flex items-center space-x-1.5"
        >
          <span>Open Web Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </div>
  );
};

export default App;
