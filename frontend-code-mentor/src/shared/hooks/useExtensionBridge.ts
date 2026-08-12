import { useState, useEffect, useCallback } from 'react';
import { clearStorageItems, getStorageItem, isExtensionEnvironment } from '../lib/platform';
import { apiPath, apiUrl } from '../config';

// ---------------------------------------------------------------------------
// Auth types
// ---------------------------------------------------------------------------

const AUTH_KEYS = [
  'codementor_token',
  'codementor_email',
  'user_role',
  'codementor_handle',
] as const;

export interface AuthState {
  isAuth: boolean;
  token: string | null;
  email: string;
  role: 'student' | 'teacher';
  handle: string;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// useAuth — reads ONLY auth credentials from the active platform store.
// Extension pages use chrome.storage.local; web pages use localStorage.
// All business data is fetched from the backend directly using the token.
// ---------------------------------------------------------------------------
export function useAuth(): AuthState & { logout: () => Promise<void> } {
  const [token,  setToken]  = useState<string | null>(null);
  const [email,  setEmail]  = useState<string>('');
  const [role,   setRole]   = useState<'student' | 'teacher'>('student');
  const [handle, setHandle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [storedToken, storedEmail, storedRole, storedHandle] = await Promise.all([
      getStorageItem('codementor_token'),
      getStorageItem('codementor_email'),
      getStorageItem('user_role'),
      getStorageItem('codementor_handle'),
    ]);

    setToken(storedToken);
    setEmail(storedEmail ?? '');
    setRole(storedRole === 'teacher' ? 'teacher' : 'student');
    setHandle(storedHandle ?? '');
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      await reload();
      if (mounted) {
        setLoading(false);
      }
    };

    const handleStorage = () => {
      void reload();
    };

    void load();
    window.addEventListener('storage', handleStorage);

    if (isExtensionEnvironment()) {
      const handleChromeStorage = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string,
      ) => {
        if (areaName !== 'local') return;
        if (AUTH_KEYS.some((key) => key in changes)) {
          void reload();
        }
      };

      chrome.storage.onChanged.addListener(handleChromeStorage);
      return () => {
        mounted = false;
        window.removeEventListener('storage', handleStorage);
        chrome.storage.onChanged.removeListener(handleChromeStorage);
      };
    }

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, [reload]);

  const logout = useCallback(async () => {
    try {
      await fetch(apiPath('auth/logout'), { method: 'POST', credentials: 'include' });
    } catch { /* best-effort */ }
    await clearStorageItems([...AUTH_KEYS]);
    setToken(null);
    setEmail('');
    setRole('student');
    setHandle('');
    // Dispatch so other hooks / contentSync pick it up
    window.dispatchEvent(new Event('storage'));
  }, []);

  return { isAuth: !!token, token, email, role, handle, loading, logout };
}

// ---------------------------------------------------------------------------
// apiGet — thin helper so extension views can call backend with the stored JWT
// ---------------------------------------------------------------------------
export async function apiGet<T>(path: string, token: string | null): Promise<T | null> {
  if (!token) return null;
  try {
    const res = await fetch(apiUrl(path), {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Backward-compat: keep the old export name so existing imports don't break.
// Most fields are now stubs — views should switch to useAuth() + direct fetch.
// ---------------------------------------------------------------------------

/** @deprecated Use useAuth() instead */
export function useExtensionBridge() {
  const auth = useAuth();

  // Provide no-op / empty stubs for the old API surface so existing code
  // continues to compile while we migrate view-by-view.
  const noop = useCallback(() => {}, []);

  return {
    // auth fields
    isAuth: auth.isAuth,
    token: auth.token,
    email: auth.email,
    role: auth.role,
    handle: auth.handle,

    // stubs — data now comes from backend, not localStorage
    currentProblem: null as any,
    latestHints: [] as any[],
    progress: {} as Record<string, any>,
    settings: {
      theme: 'system' as const,
      enabled: true,
      showHints: true,
      showProgress: true,
      autoCapture: true,
      notifications: true,
      dataCollection: false,
    },
    activeAssignmentContext: null as any,

    // actions
    requestHint: noop,
    openOptions: noop,
    toggleExtension: noop,
    updateSettings: noop,
    resetProgress: noop,
    logout: auth.logout,
  };
}
