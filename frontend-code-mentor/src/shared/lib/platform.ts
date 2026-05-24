export function isExtensionEnvironment(): boolean {
  return typeof chrome !== 'undefined' && chrome.runtime !== undefined && chrome.storage !== undefined && chrome.storage.local !== undefined;
}

export async function getStorageItem(key: string): Promise<string | null> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] !== undefined ? String(result[key]) : null);
        });
      } catch (err) {
        console.error(`Error reading ${key} from extension storage, falling back to localStorage:`, err);
        resolve(localStorage.getItem(key));
      }
    });
  } else {
    return localStorage.getItem(key);
  }
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve();
        });
      } catch (err) {
        console.error(`Error writing ${key} to extension storage, falling back to localStorage:`, err);
        localStorage.setItem(key, value);
        resolve();
      }
    });
  } else {
    localStorage.setItem(key, value);
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove([key], () => {
          resolve();
        });
      } catch (err) {
        console.error(`Error removing ${key} from extension storage, falling back to localStorage:`, err);
        localStorage.removeItem(key);
        resolve();
      }
    });
  } else {
    localStorage.removeItem(key);
  }
}

export async function clearStorageItems(keys: string[]): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove(keys, () => {
          resolve();
        });
      } catch (err) {
        console.error("Error clearing keys from extension storage, falling back to localStorage:", err);
        keys.forEach((k) => localStorage.removeItem(k));
        resolve();
      }
    });
  } else {
    keys.forEach((key) => localStorage.removeItem(key));
  }
}
