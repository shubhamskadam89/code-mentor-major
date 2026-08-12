// Background service worker for CodeMentor extension
import { apiService } from '../services/apiService'
import { apiV1Path } from '../shared/config'
console.log('CodeMentor background script loaded');

let latestCodingTabId: number | undefined;
let latestCodingTabUrl: string | undefined;

function rememberCodingTab(tabId?: number, url?: string) {
  if (tabId !== undefined && tabId !== null) {
    latestCodingTabId = tabId;
  }
  if (url) {
    latestCodingTabUrl = url;
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('CodeMentor extension installed:', details);

  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      theme: 'light',
      enabled: true,
      showHints: true,
      showProgress: true,
      autoCapture: true
    },
    userProgress: {}
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  let isAsync = false;

  switch (message.type) {
    case 'CAPTURE_CODE':
      handleCodeCapture(message.data, sender.tab?.id);
      sendResponse({ success: true });
      break;

    case 'CAPTURE_SIGNAL':
      handleSignal(message.data, sender.tab?.id);
      sendResponse({ success: true });
      break;

    case 'REQUEST_HINT':
      handleRequestHint(sender.tab?.id).then(sendResponse);
      isAsync = true;
      break;

    case 'CAPTURE_PROBLEM':
      rememberCodingTab(sender.tab?.id, message.data?.url);
      handleProblemCapture(message.data, sender.tab?.id);
      sendResponse({ success: true });
      break;

    case 'CAPTURE_CODE_UPDATE':
      rememberCodingTab(sender.tab?.id, message.data?.url);
      handleCodeUpdate(message.data, sender.tab?.id);
      sendResponse({ success: true });
      break;

    case 'LOG_PROBLEM_ATTEMPT':
      apiService.logProblemAttempt(message.data).catch(console.error);
      sendResponse({ success: true });
      break;

    case 'GET_SETTINGS':
      chrome.storage.local.get(['settings'], (result) => {
        sendResponse(result.settings || {});
      });
      isAsync = true;
      break;

    case 'SAVE_PROGRESS':
      handleProgressSave(message.data);
      sendResponse({ success: true });
      break;

    case 'GET_PROGRESS':
      chrome.storage.local.get(['userProgress'], (result) => {
        sendResponse(result.userProgress || {});
      });
      isAsync = true;
      break;

    case 'GET_HINTS': {
      const { code, language, problemId } = message.data || {};
      (async () => {
        try {
          let effectiveCode: string | undefined = code;
          if (!effectiveCode && problemId) {
            const store = await chrome.storage.local.get(['problemCodeMap']);
            const map = store.problemCodeMap || {};
            effectiveCode = map[problemId]?.code;
          }
          const hints = await apiService.getHintsForCode(effectiveCode || '', language || 'unknown', problemId);
          sendResponse(hints);
        } catch (e) {
          console.error('GET_HINTS failed:', e);
          sendResponse([]);
        }
      })();
      isAsync = true;
      break;
    }

    case 'SEND_CODE_TO_AI': {
      const { code, language, problemId } = message.data || {};
      (async () => {
        try {
          const analysis = await apiService.analyzeCodeLegacy(code, language, problemId);
          sendResponse(analysis);
        } catch (e) {
          console.error('SEND_CODE_TO_AI failed:', e);
          sendResponse(null);
        }
      })();
      isAsync = true;
      break;
    }

    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      break;

    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }

  if (isAsync) {
    return true; // Keep message channel open for async response
  }
});

// Check if the current problem belongs to an active student assignment
async function checkProblemAssignment(problemId: string) {
  try {
    const result = await chrome.storage.local.get(['codementor_handle']);
    const handle = result.codementor_handle;
    if (!handle) return;

    console.log('Checking assignment status for problem:', problemId, 'for handle:', handle);
    const res = await fetch(apiV1Path(`dashboard/assignments/${handle}`));
    if (!res.ok) {
      console.warn('Failed to fetch assignments in background check:', res.status);
      return;
    }

    const assignments = await res.json();
    if (!Array.isArray(assignments)) return;

    // Clean slugs to match: e.g. "leetcode_two-sum" -> "two-sum"
    const cleanId = problemId.toLowerCase().replace(/^(leetcode|gfg|codechef|hackerrank)_/, '').replace(/_/g, '-').trim();

    for (const a of assignments) {
      if (a.problems && Array.isArray(a.problems)) {
        const hasProblem = a.problems.some((p: any) => {
          const pId = p.problemId.toLowerCase().replace(/^(leetcode|gfg|codechef|hackerrank)_/, '').replace(/_/g, '-').trim();
          return pId === cleanId;
        });

        if (hasProblem) {
          const solvedCount = a.problems.filter((p: any) => p.completed).length;
          const totalCount = a.problems.length;
          
          const context = {
            title: a.title,
            course: a.course,
            dueDate: a.dueDate,
            problemsSolved: solvedCount,
            totalProblems: totalCount,
            status: a.status
          };
          
          await chrome.storage.local.set({ activeAssignmentContext: context });
          console.log('Assignment context active:', context);
          return;
        }
      }
    }

    // If no assignment matched, remove any existing activeAssignmentContext
    await chrome.storage.local.remove('activeAssignmentContext');
  } catch (err) {
    console.error('Error checking assignment status:', err);
  }
}

// Handle code capture from content script
function handleCodeCapture(data: any, _tabId?: number) {
  console.log('Code captured:', data);
  rememberCodingTab(_tabId);

  // Store current problem info for popup/state
  const currentProblem = {
    id: data.problemId,
    title: data.problemTitle,
    language: data.language,
    platform: data.platform
  }
  chrome.storage.local.set({ currentProblem })
  checkProblemAssignment(data.problemId);

  // Store latest code for this problem in a map
  chrome.storage.local.get(['problemCodeMap'], (result) => {
    const problemCodeMap = result.problemCodeMap || {}
    problemCodeMap[data.problemId] = {
      code: data.code,
      language: data.language,
      timestamp: Date.now()
    }
    chrome.storage.local.set({ problemCodeMap })
  })

  // TODO: Send to AI service when backend is ready
  // For now, we'll just log it
  console.log('Code ready for AI processing:', {
    problemId: data.problemId,
    code: data.code,
    language: data.language
  });
}

// Helper to get a stable key for a problem URL (e.g., from LeetCode)
function getProblemKey(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('leetcode.com')) {
      // Extract the slug (e.g., /problems/add-two-numbers/description/ -> add-two-numbers)
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      return match ? `leetcode_${match[1]}` : url;
    }
    if (parsed.hostname.includes('geeksforgeeks.org')) {
      const match = parsed.pathname.match(/\/problems\/([^/]+)/);
      return match ? match[1] : url;
    }
    return url;
  } catch {
    return url;
  }
}

function detectPlatformFromUrl(url?: string): 'LEETCODE' | 'GEEKSFORGEEKS' | 'HACKERRANK' | 'CODECHEF' {
  if (!url) return 'LEETCODE';
  if (url.includes('geeksforgeeks.org')) return 'GEEKSFORGEEKS';
  if (url.includes('hackerrank.com')) return 'HACKERRANK';
  if (url.includes('codechef.com')) return 'CODECHEF';
  return 'LEETCODE';
}

async function logHintUsage(data: any, response: any) {
  const hints = Array.isArray(response?.hints) ? response.hints : [];
  if (hints.length === 0) return;

  try {
    const store = await chrome.storage.local.get(['codementor_handle']);
    const handle = store.codementor_handle;
    if (!handle) {
      console.warn('Skipping hint usage tracking: no codementor handle in storage.');
      return;
    }

    const problemId = getProblemKey(data.url);
    await fetch(apiV1Path('tracking/hint'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        platform: detectPlatformFromUrl(data.url),
        problemId,
        difficulty: data.difficulty || 'Medium',
        hintsUsed: hints.length,
        completed: false,
        hintOnly: true
      })
    });
  } catch (err) {
    console.error('Failed to log hint usage:', err);
  }
}

function handleProblemCapture(data: any, tabId?: number) {
  console.log('Problem captured:', data);
  rememberCodingTab(tabId, data?.url);
  const problemId = getProblemKey(data.url);
  checkProblemAssignment(problemId);

  apiService.detectProblem(data).then(response => {
    console.log('Problem context established:', response.problemContextId);

    // Store context ID associated with the problem URL or ID
    chrome.storage.local.get(['problemContextMap'], (result) => {
      const map = result.problemContextMap || {};
      const key = getProblemKey(data.url);
      map[key] = response.problemContextId;
      chrome.storage.local.set({ problemContextMap: map });
    });

  }).catch(err => {
    console.error('Error detecting problem:', err);
  });
}

function handleCodeUpdate(data: any, tabId?: number) {
  // data should contain { sessionId, language, rawCode, signalVector, url }
  console.log('Code update captured:', data);
  rememberCodingTab(tabId, data?.url);

  chrome.storage.local.get(['problemContextMap'], (result) => {
    const map = result.problemContextMap || {};
    const key = getProblemKey(data.url);
    const problemContextId = map[key];

    if (!problemContextId) {
      console.warn('No problem context ID found for key:', key);
      // Optional: Re-trigger capture if missing?
      return;
    }

    chrome.storage.local.get(['codementor_handle', 'problemHintDepthMap'], (authStore) => {
      const problemId = getProblemKey(data.url);
      const depthMap = authStore.problemHintDepthMap || {};
      const hintDepth = depthMap[problemId] || 1;

      const updateRequest = {
      sessionId: data.sessionId,
      problemContextId: problemContextId,
      language: data.language,
      rawCode: data.rawCode,
      signalVector: data.signalVector,
      handle: authStore.codementor_handle,
      problemId,
      hintDepth
      };

      apiService.analyzeCode(updateRequest).then(async response => {
      console.log('Received analysis response from backend:', response);

      logHintUsage(data, response);

      if (response.hints && response.hints.length > 0) {
        depthMap[problemId] = Math.min(5, hintDepth + 1);
        chrome.storage.local.set({ problemHintDepthMap: depthMap });
      }

      const historyStore = await chrome.storage.local.get(['problemHintHistoryMap']);
      const historyMap = historyStore.problemHintHistoryMap || {};
      const previousHints = Array.isArray(historyMap[problemId]) ? historyMap[problemId] : [];
      const nextHints = response.hints && response.hints.length > 0
        ? [...previousHints, ...response.hints]
        : previousHints;
      historyMap[problemId] = nextHints;

      // Store the full hint trail for this problem until it is solved.
      chrome.storage.local.set({
        latestHints: nextHints,
        activeHintProblemId: problemId,
        problemHintHistoryMap: historyMap
      });

      // -> BROADCAST HINT UPDATE TO POPUP AND ANY OTHER ACTIVE LISTENERS
      chrome.runtime.sendMessage({
        type: 'HINT_UPDATE',
        data: { ...response, hints: nextHints }
      }).catch(() => { /* Ignore Error if popup is closed */ });

      if (tabId !== undefined && tabId !== null) {
        console.log('SENDING HINT_UPDATE TO TAB ID:', tabId, 'Data:', response);
        chrome.tabs.sendMessage(tabId, {
          type: 'HINT_UPDATE',
          data: { ...response, hints: nextHints }
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to tab:', chrome.runtime.lastError.message);
          } else {
            console.log('Message sent successfully to tab, response:', result);
          }
        });
      } else {
        console.warn('Cannot send HINT_UPDATE: tabId is missing', { tabId, response });
      }
    }).catch(err => {
      console.error('Error in analyzeCode promise chain:', err);
    });
    });
  });
}

// Handle progress saving
function handleProgressSave(data: any) {
  chrome.storage.local.get(['userProgress'], (result) => {
    const userProgress = result.userProgress || {};

    if (!userProgress[data.problemId]) {
      userProgress[data.problemId] = {
        attempts: 0,
        hintsUsed: [],
        timeSpent: 0,
        lastAttempt: null
      };
    }

    userProgress[data.problemId].attempts += 1;
    userProgress[data.problemId].lastAttempt = Date.now();

    if (data.hintsUsed) {
      userProgress[data.problemId].hintsUsed = [
        ...new Set([...userProgress[data.problemId].hintsUsed, ...data.hintsUsed])
      ];
    }

    chrome.storage.local.set({ userProgress });
    console.log('Progress saved:', userProgress[data.problemId]);
  });
}

async function handleRequestHint(tabId?: number): Promise<{ success: boolean; tabId?: number; error?: string; capture?: any }> {
  const targetTabId = tabId ?? latestCodingTabId;

  if (targetTabId) {
    console.log('Requesting hint capture from coding tab:', {
      targetTabId,
      latestCodingTabUrl
    });

    try {
      const capture = await chrome.tabs.sendMessage(targetTabId, { type: 'TRIGGER_CAPTURE' });
      console.log('Hint capture trigger response:', capture);
      return { success: !!capture?.success, tabId: targetTabId, capture };
    } catch (err) {
      console.warn('Failed to trigger capture on remembered coding tab:', err);
    }
  }

  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  const activeTabId = tabs[0]?.id;

  if (!activeTabId) {
    console.warn('Cannot request hint: no active tab and no remembered coding tab.');
    return { success: false, error: 'NO_CODING_TAB' };
  }

  console.log('Requesting hint capture from active tab fallback:', {
    activeTabId,
    url: tabs[0]?.url
  });

  try {
    const capture = await chrome.tabs.sendMessage(activeTabId, { type: 'TRIGGER_CAPTURE' });
    console.log('Hint capture fallback response:', capture);
    return { success: !!capture?.success, tabId: activeTabId, capture };
  } catch (err) {
    console.error('Failed to trigger capture on active tab fallback:', err);
    return { success: false, tabId: activeTabId, error: 'CAPTURE_TRIGGER_FAILED' };
  }
}

function handleSignal(data: any, tabId?: number) {
  console.log('Signal captured:', data);

  apiService.sendSignal(data).then(response => {
    console.log('Signal response:', response);

    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'HINT_UPDATE',
        data: response
      });
    }

  }).catch(err => {
    console.error('Signal API error:', err);
  });
}


// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const supportedSites = [
      'leetcode.com',
      'geeksforgeeks.org',
      'hackerrank.com',
      'codeforces.com',
      'atcoder.jp'
    ];

    const isSupported = supportedSites.some(site => tab.url?.includes(site));

    if (isSupported) {
      console.log('Supported coding platform detected:', tab.url);
      // Content script will be automatically injected via manifest
    }
  }
});

export { };
