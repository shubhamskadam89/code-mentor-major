// CodeMentor Auth-Only Content Script
// RESPONSIBILITY: Sync ONLY authentication credentials between web app localStorage and chrome.storage.local.
// Business data (hints, progress, assignments) is fetched directly from backend APIs — NOT synced here.
console.log('[CodeMentor] Auth sync script active');

const AUTH_KEYS = [
  'codementor_token',
  'codementor_email',
  'user_role',
  'codementor_handle',
] as const;

// --- Page → Extension: push credentials from web-app localStorage to chrome.storage.local ---
function syncPageToExtension() {
  const token  = localStorage.getItem('codementor_token');
  const email  = localStorage.getItem('codementor_email');
  const role   = localStorage.getItem('user_role');
  const handle = localStorage.getItem('codementor_handle');

  chrome.storage.local.get([...AUTH_KEYS], (result) => {
    const updates: Record<string, string> = {};

    if (token  !== result.codementor_token)  updates.codementor_token  = token  ?? '';
    if (email  !== result.codementor_email)  updates.codementor_email  = email  ?? '';
    if (role   !== result.user_role)         updates.user_role         = role   ?? 'student';
    if (handle !== result.codementor_handle) updates.codementor_handle = handle ?? '';

    if (Object.keys(updates).length > 0) {
      console.log('[CodeMentor] Syncing credentials page → extension:', Object.keys(updates));
      chrome.storage.local.set(updates);
    }
  });
}

// --- Extension → Page: push credentials from chrome.storage.local back to web-app localStorage ---
function syncExtensionToPage() {
  chrome.storage.local.get([...AUTH_KEYS], (result) => {
    let changed = false;

    if (result.codementor_token  !== undefined && localStorage.getItem('codementor_token')  !== result.codementor_token)  { localStorage.setItem('codementor_token',  result.codementor_token);  changed = true; }
    if (result.codementor_email  !== undefined && localStorage.getItem('codementor_email')  !== result.codementor_email)  { localStorage.setItem('codementor_email',  result.codementor_email);  changed = true; }
    if (result.user_role         !== undefined && localStorage.getItem('user_role')         !== result.user_role)         { localStorage.setItem('user_role',         result.user_role);         changed = true; }
    if (result.codementor_handle !== undefined && localStorage.getItem('codementor_handle') !== result.codementor_handle) { localStorage.setItem('codementor_handle', result.codementor_handle); changed = true; }

    if (changed) {
      console.log('[CodeMentor] Auth credentials synced extension → page.');
      window.dispatchEvent(new Event('storage'));
    }
  });
}

// --- Initial bootstrap sync ---
syncPageToExtension();
syncExtensionToPage();

// --- Watch page localStorage for auth changes and push to extension ---
window.addEventListener('storage', (e: StorageEvent) => {
  if (e.key && (AUTH_KEYS as readonly string[]).includes(e.key)) {
    syncPageToExtension();
  }
});

// Polling fallback — catches same-origin login that doesn't fire the storage event
setInterval(syncPageToExtension, 2000);

// --- Watch extension storage for auth changes and push to page ---
chrome.storage.onChanged.addListener((changes) => {
  const authChanged = AUTH_KEYS.some((k) => k in changes);
  if (authChanged) {
    syncExtensionToPage();
  }

  // Handle extension-initiated logout: clear page localStorage auth keys
  if (changes.codementor_token && !changes.codementor_token.newValue) {
    console.log('[CodeMentor] Extension logout detected — clearing page localStorage auth.');
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event('storage'));
  }
});
