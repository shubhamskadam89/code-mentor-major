const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '');

const readEnv = (key: 'VITE_API_BASE_URL' | 'VITE_APP_BASE_URL' | 'VITE_WS_BASE_URL') => {
  const value = import.meta.env[key];
  return typeof value === 'string' ? trimTrailingSlash(value) : '';
};

const currentWebOrigin = () => {
  if (typeof window === 'undefined') return '';
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return trimTrailingSlash(window.location.origin);
  }
  return '';
};

export const API_ORIGIN = readEnv('VITE_API_BASE_URL') || currentWebOrigin();
export const APP_ORIGIN = readEnv('VITE_APP_BASE_URL') || currentWebOrigin();
export const WS_ORIGIN = readEnv('VITE_WS_BASE_URL');

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

export function appUrl(hashPath = '') {
  const normalizedHash = trimLeadingSlash(hashPath);
  const hash = normalizedHash ? `#/${normalizedHash}` : '';
  return APP_ORIGIN ? `${APP_ORIGIN}/${hash}` : `/${hash}`;
}

export function websocketUrl(path = '/ws') {
  if (WS_ORIGIN) return `${WS_ORIGIN}/${trimLeadingSlash(path)}`;
  if (!API_ORIGIN) return '';
  return `${API_ORIGIN.replace(/^http/, 'ws')}/${trimLeadingSlash(path)}`;
}
