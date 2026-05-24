import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setStorageItem } from '../../../shared/lib/platform';

/**
 * /auth/callback
 *
 * Landing page after Google OAuth redirect.
 * The backend redirects here with query params on the hash:
 *   http://localhost:3000/#/auth/callback?token=...&email=...&role=...&name=...
 *
 * Responsibilities:
 *  1. Read token, email, role, name from the URL hash search params
 *  2. Store them in localStorage (and chrome.storage.local if in extension context)
 *  3. Redirect to the correct dashboard
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      // Hash router puts everything in the hash, e.g. /#/auth/callback?token=...
      // Extract search params from the hash portion after '?'
      const hashPart = window.location.hash; // e.g. "#/auth/callback?token=abc&email=..."
      const queryStart = hashPart.indexOf('?');
      const searchString = queryStart !== -1 ? hashPart.substring(queryStart) : window.location.search;
      const params = new URLSearchParams(searchString);

      const token = params.get('token');
      const email = params.get('email');
      const urlHandle = params.get('handle');
      const role  = (params.get('role')?.toLowerCase() ?? 'student') as 'student' | 'teacher';

      // Handle OAuth errors
      const error = params.get('error');
      if (error) {
        console.error('[AuthCallback] OAuth error:', error);
        navigate('/', { replace: true });
        return;
      }

      if (!token || !email) {
        console.warn('[AuthCallback] No token/email in callback URL — redirecting home.');
        navigate('/', { replace: true });
        return;
      }

      const handle = urlHandle && urlHandle.trim() ? urlHandle.trim() : email.split('@')[0];

      // 1. Store in localStorage via AuthContext
      await login(handle, email, role, token);

      // 2. Also store explicitly so contentSync picks it up for the extension
      await setStorageItem('codementor_token',  token);
      await setStorageItem('codementor_email',  email);
      await setStorageItem('codementor_handle', handle);
      await setStorageItem('user_role',         role);

      // 3. Sync to chrome.storage.local if inside extension context
      if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
        chrome.storage.local.set({ codementor_token: token, codementor_email: email, codementor_handle: handle, user_role: role });
      }

      // 4. Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname + '#/');

      // 5. Navigate to correct dashboard
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show a brief loading spinner while processing
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-zinc-400">Signing you in...</p>
      </div>
    </div>
  );
}
