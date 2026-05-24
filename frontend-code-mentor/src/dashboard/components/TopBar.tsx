import { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const THEME_KEY = 'app_theme';

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored !== null) return stored === 'dark';
    } catch { /* ignore */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export function TopBar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  const profileRoute = user?.role === 'teacher' ? '/teacher/profile' : '/student/profile';

  return (
    <header className="cm-nav-surface h-16 flex-shrink-0 border-b flex items-center justify-between px-6 z-10 w-full">
      <div className="flex items-center space-x-4">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="font-extrabold text-lg text-zinc-900 dark:text-white capitalize">
          {user ? `${user.role === 'teacher' ? 'Instructor' : 'Student'} Portal` : 'CodeMentor'}
        </h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role badge */}
        {user && (
          <span className="hidden sm:inline-block px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
            {user.role}
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-1.5 group"
              aria-expanded={profileOpen}
              aria-label="Profile menu"
            >
              <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-black flex items-center justify-center select-none shadow-sm text-sm">
                {user.handle.charAt(0).toUpperCase()}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="font-bold text-zinc-900 dark:text-white text-sm truncate">{user.handle}</div>
                  <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                </div>

                {/* Profile link */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(profileRoute);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
