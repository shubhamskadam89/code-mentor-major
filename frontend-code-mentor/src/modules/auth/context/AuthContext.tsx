import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, clearStorageItems } from '../../../shared/lib/platform';
import { apiPath } from '../../../shared/config';

export interface UserSession {
  handle: string;
  email: string;
  role: 'student' | 'teacher';
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (handle: string, email: string, role: 'student' | 'teacher', token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string): { email?: string; role?: string; handle?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      email: parsed.sub || parsed.email,
      role: parsed.role || (Array.isArray(parsed.roles) ? parsed.roles[0] : undefined),
      handle: parsed.handle || parsed.name,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        // Check for redirect URL parameters from Google OAuth
        let searchString = window.location.search;
        if (!searchString && window.location.hash.includes('?')) {
          searchString = window.location.hash.substring(window.location.hash.indexOf('?'));
        }
        const params = new URLSearchParams(searchString);
        const urlToken = params.get('token');
        const urlEmail = params.get('email');
        const urlRole = params.get('role');
        const urlHandle = params.get('handle') || params.get('name');

        if (urlToken) {
          const email = urlEmail || decodeJwt(urlToken)?.email || '';
          const handle = urlHandle && urlHandle.trim() ? urlHandle.trim() : (email.split('@')[0] || 'User');
          const role = ((urlRole || decodeJwt(urlToken)?.role || 'student').toLowerCase()) as 'student' | 'teacher';
          
          await setStorageItem('codementor_token', urlToken);
          await setStorageItem('codementor_handle', handle);
          await setStorageItem('codementor_email', email);
          await setStorageItem('user_role', role);

          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
              codementor_token: urlToken,
              codementor_handle: handle,
              codementor_email: email,
              user_role: role
            });
          }

          setUser({ handle, email, role });
          setToken(urlToken);
          setLoading(false);
          return;
        }

        const storedToken = await getStorageItem('codementor_token');
        const storedHandle = await getStorageItem('codementor_handle');
        const storedEmail = await getStorageItem('codementor_email');
        const storedRole = await getStorageItem('user_role');

        if (storedToken) {
          let email = storedEmail || '';
          let role = (storedRole?.toLowerCase() || 'student') as 'student' | 'teacher';
          let handle = storedHandle || '';

          const decoded = decodeJwt(storedToken);
          if (decoded) {
            if (!email && decoded.email) email = decoded.email;
            if (!storedRole && decoded.role) role = decoded.role.toLowerCase() as 'student' | 'teacher';
            if (!handle && decoded.handle) handle = decoded.handle;
          }

          if (!handle && email) {
            handle = email.split('@')[0];
          }

          setUser({
            handle: handle || 'Student',
            email: email || '',
            role: role || 'student',
          });
          setToken(storedToken);

          // Verify with backend
          try {
            const meResponse = await fetch(apiPath('auth/me'), {
              headers: { Authorization: `Bearer ${storedToken}` },
              credentials: 'include',
            });

            if (meResponse.ok) {
              const me = await meResponse.json();
              const session = me?.data;
              if (session) {
                if (session.handle) handle = session.handle;
                if (session.email) email = session.email;
                if (session.role) role = session.role.toLowerCase() as 'student' | 'teacher';

                await setStorageItem('codementor_handle', handle);
                await setStorageItem('codementor_email', email);
                await setStorageItem('user_role', role);

                setUser({ handle, email, role });
              }
            } else if (meResponse.status === 401 || meResponse.status === 403) {
              await clearStorageItems(['codementor_handle', 'codementor_email', 'user_role', 'codementor_token']);
              setUser(null);
              setToken(null);
            }
          } catch (err) {
            console.warn("Could not refresh session from backend; using stored auth.", err);
          }
        }
      } catch (err) {
        console.error("Error loading session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (handle: string, email: string, role: 'student' | 'teacher', sessionToken: string) => {
    try {
      await setStorageItem('codementor_handle', handle);
      await setStorageItem('codementor_email', email);
      await setStorageItem('user_role', role);
      await setStorageItem('codementor_token', sessionToken);

      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'CODEMENTOR_AUTH_SYNC', token: sessionToken, email, handle, role }, '*');
        window.dispatchEvent(new CustomEvent('codementor-auth-changed'));
        window.dispatchEvent(new Event('storage'));
      }

      setUser({ handle, email, role });
      setToken(sessionToken);
    } catch (err) {
      console.error("Error storing session:", err);
    }
  };

  const logout = async () => {
    try {
      await clearStorageItems(['codementor_handle', 'codementor_email', 'user_role', 'codementor_token']);
      if (typeof window !== 'undefined') {
        window.postMessage({ type: 'CODEMENTOR_AUTH_SYNC', token: '', email: '', handle: '', role: 'student' }, '*');
        window.dispatchEvent(new CustomEvent('codementor-auth-changed'));
        window.dispatchEvent(new Event('storage'));
      }
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error("Error clearing session:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
