const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '');

const readEnv = (key: 'VITE_API_BASE_URL' | 'VITE_APP_BASE_URL' | 'VITE_WS_BASE_URL') => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? trimTrailingSlash(value.trim()) : '';
};

const resolveApiOrigin = () => {
  const envApi = readEnv('VITE_API_BASE_URL');
  if (envApi) return envApi;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
  }

  return 'https://code-mentor.duckdns.org';
};

const resolveAppOrigin = () => {
  const envApp = readEnv('VITE_APP_BASE_URL');
  if (envApp) return envApp;

  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return trimTrailingSlash(window.location.origin);
    }
  }

  return 'https://code-mentor-major.vercel.app';
};

export const API_ORIGIN = resolveApiOrigin();
export const APP_ORIGIN = resolveAppOrigin();
export const WS_ORIGIN = readEnv('VITE_WS_BASE_URL') || API_ORIGIN.replace(/^http/, 'ws');

export const API_BASE_URL = `${API_ORIGIN}/api`;
export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;

export function apiUrl(path: string) {
  return `${API_ORIGIN}/${trimLeadingSlash(path)}`;
}

export function apiPath(path: string) {
  return `${API_BASE_URL}/${trimLeadingSlash(path)}`;
}

export function apiV1Path(path: string) {
  return `${API_V1_BASE_URL}/${trimLeadingSlash(path)}`;
}

export function appUrl(path = '') {
  const normalizedPath = trimLeadingSlash(path);
  return APP_ORIGIN ? `${APP_ORIGIN}/${normalizedPath}` : `/${normalizedPath}`;
}

export function websocketUrl(path = '/ws') {
  if (WS_ORIGIN) return `${WS_ORIGIN}/${trimLeadingSlash(path)}`;
  if (!API_ORIGIN) return '';
  return `${API_ORIGIN.replace(/^http/, 'ws')}/${trimLeadingSlash(path)}`;
}
