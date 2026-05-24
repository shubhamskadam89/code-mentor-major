import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, clearStorageItems } from '../../../shared/lib/platform';

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

        if (urlToken && urlEmail) {
          const handle = urlEmail.split('@')[0];
          const role = (urlRole?.toLowerCase() || 'student') as 'student' | 'teacher';
          
          await setStorageItem('codementor_token', urlToken);
          await setStorageItem('codementor_handle', handle);
          await setStorageItem('codementor_email', urlEmail);
          await setStorageItem('user_role', role);

          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
              codementor_token: urlToken,
              codementor_handle: handle,
              codementor_email: urlEmail,
              user_role: role
            });
          }

          // Clear query params from the address bar, keeping the hash route intact
          const hashWithoutQuery = window.location.hash.split('?')[0];
          window.history.replaceState({}, document.title, window.location.pathname + (hashWithoutQuery || '#/'));

          setUser({ handle, email: urlEmail, role });
          setToken(urlToken);
          setLoading(false);
          return;
        }

        const storedHandle = await getStorageItem('codementor_handle');
        const storedEmail = await getStorageItem('codementor_email');
        const storedRole = await getStorageItem('user_role');
        const storedToken = await getStorageItem('codementor_token');

        if (storedHandle && storedEmail && storedRole && storedToken) {
          setUser({
            handle: storedHandle,
            email: storedEmail,
            role: storedRole as 'student' | 'teacher',
          });
          setToken(storedToken);
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

      setUser({ handle, email, role });
      setToken(sessionToken);
    } catch (err) {
      console.error("Error storing session:", err);
    }
  };

  const logout = async () => {
    try {
      await clearStorageItems(['codementor_handle', 'codementor_email', 'user_role', 'codementor_token']);
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
