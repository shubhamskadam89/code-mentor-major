// Content script for CodeMentor extension
console.log('CodeMentor content script loaded');

interface CodeEditor {
  element: HTMLElement;
  getValue: () => string;
  setValue: (value: string) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}
// Removed inline ExtractedProblem


import { ExtractedProblem, SignalVector } from '../types/problem';

// Removed inline interfaces in favor of imports


interface ProblemInfo {
  id: string;
  title: string;
  difficulty: string;
  platform: string;
}


class CodeCaptureService {
  private currentEditor: CodeEditor | null = null;
  private lastCapturedCode = '';
  private enabled = true;
  private sessionId: string | null = null;
  private overlayContainer: HTMLElement | null = null;
  private hasLoggedCompletion = false;

  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup() {
    console.log('Setting up CodeMentor content script');
    // Generate stable session ID
    this.sessionId = 'session-' + Math.random().toString(36).slice(2);
    // Load initial enabled setting
    try {
      chrome.storage?.local.get(['settings'], (result) => {
        if (result?.settings && typeof result.settings.enabled === 'boolean') {
          this.enabled = result.settings.enabled
        }
      })
    } catch { }

    // Detect the coding platform
    this.detectPlatform();

    // Find and setup code editor
    this.findCodeEditor();

    // Start polling for code edits
    this.startPolling();

    // Listen for page changes (SPA navigation)
    this.observePageChanges();

    // Initial problem detection
    this.extractAndSendProblem();

    // Start tracking submissions for success
    this.observeSubmissions();

    // Listen for toggle and trigger messages
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg?.type === 'TOGGLE_EXTENSION') {
        this.enabled = !!msg.enabled
      } else if (msg?.type === 'TRIGGER_CAPTURE') {
        console.log('CONTENT SCRIPT: Received TRIGGER_CAPTURE');
        const captured = this.captureSignal(true);
        sendResponse({
          success: captured,
          hasEditor: !!this.currentEditor,
          codeLength: this.currentEditor?.getValue()?.length ?? 0,
          url: this.getPageUrl(),
          diagnostics: this.getEditorDiagnostics()
        });
      } else if (msg?.type === 'HINT_UPDATE') {
        console.log('CONTENT SCRIPT: Received HINT_UPDATE');
        this.updateHints(msg.data);
      }
    });

    // Initialize lightweight hint overlay
    this.createOverlay();
  }

  private createOverlay(): void {
    if (document.getElementById('codementor-hint-overlay')) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #codementor-hint-overlay {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: none;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }
      .cm-hint-card {
        background: #18181b; /* zinc-900 */
        color: #f4f4f5; /* zinc-50 */
        border: 1px solid #3f3f46; /* zinc-700 */
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: cm-slide-up 0.3s ease-out;
        pointer-events: auto;
      }
      .cm-hint-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #a1a1aa; /* zinc-400 */
      }
      .cm-hint-close {
        background: transparent;
        border: none;
        color: #a1a1aa;
        cursor: pointer;
        padding: 4px;
        font-size: 18px;
        line-height: 1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cm-hint-close:hover {
        background: #27272a; /* zinc-800 */
        color: white;
      }
      .cm-hint-message {
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      @keyframes cm-slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'codementor-hint-overlay';
    document.body.appendChild(this.overlayContainer);
  }

  private updateHints(analysis: any): void {
    if (!this.overlayContainer) return;

    this.overlayContainer.innerHTML = '';
    const hints = analysis?.hints || [];

    if (hints.length === 0) {
      this.overlayContainer.style.display = 'none';
      return;
    }

    this.overlayContainer.style.display = 'flex';

    hints.forEach((hint: any) => {
      const card = document.createElement('div');
      card.className = 'cm-hint-card';

      const header = document.createElement('div');
      header.className = 'cm-hint-header';

      const title = document.createElement('span');
      title.textContent = "💡 " + (hint.type || 'Hint');

      const closeBtn = document.createElement('button');
      closeBtn.className = 'cm-hint-close';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => {
        card.remove();
        // Hide container if all hints are closed
        if (this.overlayContainer?.children.length === 0) {
          this.overlayContainer.style.display = 'none';
        }
      };

      header.appendChild(title);
      header.appendChild(closeBtn);

      const message = document.createElement('div');
      message.className = 'cm-hint-message';
      message.textContent = hint.message || '';

      card.appendChild(header);
      card.appendChild(message);
      this.overlayContainer?.appendChild(card);
    });
  }

  private detectPlatform(): void {
    const hostname = window.location.hostname;
    let platform = 'unknown';

    if (hostname.includes('leetcode.com')) {
      platform = 'leetcode';
    } else if (hostname.includes('geeksforgeeks.org')) {
      platform = 'geeksforgeeks';
    } else if (hostname.includes('hackerrank.com')) {
      platform = 'hackerrank';
    } else if (hostname.includes('codeforces.com')) {
      platform = 'codeforces';
    } else if (hostname.includes('atcoder.jp')) {
      platform = 'atcoder';
    }

    console.log('Detected platform:', platform);
  }

  private getPageUrl(): string {
    try {
      return window.top?.location.href || window.location.href;
    } catch {
      return document.referrer || window.location.href;
    }
  }

  private getEditorDiagnostics(): Record<string, number> {
    return {
      monacoEditor: document.querySelectorAll('.monaco-editor').length,
      monacoViewLines: document.querySelectorAll('.view-lines').length,
      aceEditor: document.querySelectorAll('.ace_editor').length,
      aceLines: document.querySelectorAll('.ace_line').length,
      codeMirror5: document.querySelectorAll('.CodeMirror').length,
      codeMirror6: document.querySelectorAll('.cm-content, .cm-editor').length,
      textareas: document.querySelectorAll('textarea').length,
      contentEditable: document.querySelectorAll('[contenteditable="true"]').length,
      iframes: document.querySelectorAll('iframe').length
    };
  }

  private getProblemKeyFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('leetcode.com')) {
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

  private findCodeEditor(): void {
    // Try to find Monaco Editor (VS Code style)
    const monacoEditor = this.findMonacoEditor();
    if (monacoEditor) {
      this.setupMonacoEditor(monacoEditor);
      return;
    }

    // Try to find Ace Editor (used by many coding portals, including GFG variants)
    const aceEditor = this.findAceEditor();
    if (aceEditor) {
      this.setupAceEditor(aceEditor);
      return;
    }

    // Try to find CodeMirror editor
    const codeMirrorEditor = this.findCodeMirrorEditor();
    if (codeMirrorEditor) {
      this.setupCodeMirrorEditor(codeMirrorEditor);
      return;
    }

    // Try to find textarea-based editor
    const textareaEditor = this.findTextareaEditor();
    if (textareaEditor) {
      this.setupTextareaEditor(textareaEditor);
      return;
    }

    console.log('No code editor found, retrying in 1 second...', this.getEditorDiagnostics());
    setTimeout(() => this.findCodeEditor(), 1000);
  }

  private findMonacoEditor(): HTMLElement | null {
    // Look for standard Monaco editor class
    const monacoEditor = document.querySelector('.monaco-editor');
    if (monacoEditor) return monacoEditor as HTMLElement;

    // Look for LeetCode specific containers or view-lines
    const viewLines = document.querySelector('.view-lines');
    if (viewLines) return viewLines.closest('.monaco-editor') as HTMLElement || viewLines as HTMLElement;

    // Look for data attributes
    const dataEditor = document.querySelector('[data-cy="code-editor"]');
    if (dataEditor) return dataEditor as HTMLElement;

    return null;
  }

  private findAceEditor(): HTMLElement | null {
    const aceEditor = document.querySelector('.ace_editor');
    if (aceEditor) return aceEditor as HTMLElement;

    const aceLine = document.querySelector('.ace_line');
    if (aceLine) {
      return (aceLine.closest('.ace_editor') || aceLine.closest('[class*="editor"]') || aceLine.parentElement) as HTMLElement | null;
    }

    const aceTextInput = document.querySelector('textarea.ace_text-input');
    if (aceTextInput) {
      return (aceTextInput.closest('.ace_editor') || aceTextInput.parentElement) as HTMLElement | null;
    }

    return null;
  }

  private findCodeMirrorEditor(): HTMLElement | null {
    // CodeMirror 5
    const cm5 = document.querySelector('.CodeMirror');
    if (cm5) return cm5 as HTMLElement;

    // CodeMirror 6
    const cm6 = document.querySelector('.cm-content');
    if (cm6) return cm6 as HTMLElement;

    const cmEditor = document.querySelector('.cm-editor');
    if (cmEditor) return cmEditor as HTMLElement;

    // Generic contenteditable (fallback)
    const generic = document.querySelector('[contenteditable="true"]');
    if (
      generic &&
      (
        generic.closest('.editor-scrollable') ||
        generic.closest('[class*="code"]') ||
        generic.closest('[class*="editor"]') ||
        generic.closest('[id*="code"]') ||
        generic.closest('[id*="editor"]')
      )
    ) {
      return generic as HTMLElement;
    }

    return null;
  }

  private findTextareaEditor(): HTMLTextAreaElement | null {
    // Look for textarea with code-like content
    const textareas = document.querySelectorAll('textarea');
    for (const textarea of textareas) {
      if (textarea.placeholder?.toLowerCase().includes('code') ||
        textarea.className.includes('code') ||
        textarea.id.includes('code')) {
        return textarea;
      }
    }
    return null;
  }

  private setupMonacoEditor(element: HTMLElement): void {
    console.log('Setting up Monaco editor (DOM Scraping Mode)');

    // In a content script, we cannot access window.monaco due to isolation.
    // We must scrape the DOM or inject a script. For read-only signals, scraping is sufficient.

    this.currentEditor = {
      element,
      getValue: () => {
        // Scrape text from .view-line elements
        // They are usually divs with text content
        const lines = element.querySelectorAll('.view-line');
        if (lines.length > 0) {
          // Join text content of lines. 
          // Note: Monaco renders parts of lines in spans. textContent of the line div usually works.
          // But we need to be careful about ordering (top style attribute).
          // Usually querySelectorAll returns in document order, which is correct for lines.
          return Array.from(lines).map(line => {
            // Ensure we get text (some versions use structure like <span><span>code</span></span>)
            return line.textContent || '';
          }).join('\n');
        }

        // Fallback: Try to find a textarea usage?
        const textarea = element.querySelector('textarea.inputarea') as HTMLTextAreaElement;
        if (textarea) return textarea.value;

        return '';
      },
      setValue: (_value: string) => {
        console.warn('setValue not supported in scraping mode');
      },
      on: (_event: string, _callback: Function) => {
        // We cannot listen to Monaco model events directly.
        // We will rely on our polling mechanism in startPolling().
      },
      off: (_event: string, _callback: Function) => { }
    };

    // We don't need setupEditorListeners anymore since we rely on polling
    console.log('Monaco editor setup complete');
  }

  private setupAceEditor(element: HTMLElement): void {
    console.log('Setting up Ace editor (DOM Scraping Mode)');

    this.currentEditor = {
      element,
      getValue: () => {
        const lines = element.querySelectorAll('.ace_line');
        if (lines.length > 0) {
          return Array.from(lines).map(line => line.textContent || '').join('\n');
        }

        const textLayer = element.querySelector('.ace_text-layer');
        if (textLayer?.textContent) return textLayer.textContent;

        const textarea = element.querySelector('textarea.ace_text-input') as HTMLTextAreaElement | null;
        if (textarea?.value) return textarea.value;

        return element.innerText || element.textContent || '';
      },
      setValue: (_value: string) => {
        console.warn('setValue not supported for scraped Ace editor');
      },
      on: () => { },
      off: () => { }
    };

    console.log('Ace editor setup complete');
  }

  private setupCodeMirrorEditor(element: HTMLElement): void {
    console.log('Setting up CodeMirror/Generic editor');

    // Check if it's CM6 or generic contenteditable
    if (element.classList.contains('cm-content') || element.getAttribute('contenteditable') === 'true') {
      this.currentEditor = {
        element,
        getValue: () => {
          // For CM6, text is in .cm-line elements
          const lines = element.querySelectorAll('.cm-line');
          if (lines.length > 0) {
            return Array.from(lines).map(line => line.textContent || '').join('\n');
          }
          // Fallback for generic contenteditable
          return element.innerText || element.textContent || '';
        },
        setValue: (_value: string) => {
          console.warn('setValue not supported for scraped editor');
        },
        on: () => { },
        off: () => { }
      };
      console.log('CodeMirror 6 / Generic setup complete');
      return;
    }

    // CodeMirror 5 (Legacy)
    const codeMirror = (element as any).CodeMirror;
    if (codeMirror) {
      this.currentEditor = {
        element,
        getValue: () => codeMirror.getValue(),
        setValue: (value: string) => codeMirror.setValue(value),
        on: (event: string, callback: Function) => codeMirror.on(event, callback),
        off: (event: string, callback: Function) => codeMirror.off(event, callback)
      };
    }
  }

  private setupTextareaEditor(element: HTMLTextAreaElement): void {
    console.log('Setting up textarea editor');

    this.currentEditor = {
      element,
      getValue: () => element.value,
      setValue: (value: string) => { element.value = value; },
      on: (event: string, callback: Function) => {
        if (event === 'change') {
          element.addEventListener('input', callback as EventListener);
        }
      },
      off: (event: string, callback: Function) => {
        if (event === 'change') {
          element.removeEventListener('input', callback as EventListener);
        }
      }
    };
  }



  private captureSignal(force = false): boolean {
    if (!this.enabled) {
      console.warn('CodeMentor capture skipped: extension is disabled.');
      return false;
    }

    if (!this.currentEditor) {
      console.warn('CodeMentor capture skipped: no code editor is currently detected.');
      this.findCodeEditor();
      if (!this.currentEditor) return false;
    }

    try {
      const code = this.currentEditor.getValue();
      if (!force && !code.trim()) {
        console.warn('CodeMentor capture skipped: detected editor has no code text.');
        return false;
      }

      // Optimization: Skip if code matches last captured, unless forced.
      if (!force && code === this.lastCapturedCode) return false;

      this.lastCapturedCode = code;

      // const problemInfo = this.extractProblemInfo(); // Unused
      const signals = this.extractSignals(code);

      // Send to background script
      chrome.runtime.sendMessage({
        type: 'CAPTURE_CODE_UPDATE',
        data: {
          sessionId: this.sessionId,
          url: this.getPageUrl(), // Use top page URL for context mapping, including editor frames
          language: this.detectLanguage(),
          rawCode: code,
          signalVector: signals
        }
      });

      console.log('Signal captured and sent:', signals);
      return true;
    } catch (error) {
      console.error('Error during signal capture:', error);
      return false;
    }
  }

  private extractSignals(code: string): SignalVector {
    // Basic heuristics
    const hasRecursion = /func\s+(\w+).*?\1\(|def\s+(\w+).*?\2\(|void\s+(\w+).*?\3\(|int\s+(\w+).*?\4\(/.test(code);
    const hasDPArray = /dp\[|memo\[|cache\[/.test(code) || /vector<.*> dp/.test(code) || /int\[\].*dp/.test(code);
    const hasMemo = /memo\s*=|cache\s*=|Map<.*>/.test(code);
    const usesSort = /\.sort\(|sorted\(|Arrays\.sort\(|Collections\.sort\(/.test(code);

    // ✅ STRONG HashMap detection
    const usesHashMap =
      /Map<|HashMap<|dict\(|defaultdict|Counter|new Map\(|\{\}/.test(code) ||
      /\.put\(|\.get\(|containsKey\(|has\(/.test(code);

    // Estimate loop depth
    let maxDepth = 0;
    let currentDepth = 0;
    const lines = code.split('\n');

    for (const line of lines) {
      // Naive counting of braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      currentDepth += openBraces;
      currentDepth -= closeBraces;

      if (currentDepth > maxDepth) maxDepth = currentDepth;
    }

    return {
      hasRecursion,
      hasDPArray,
      hasMemo,
      usesSort,
      usesHashMap,
      loopDepth: Math.min(maxDepth, 5) // Cap at 5
    };
  }

  private extractProblemInfo(): ProblemInfo {
    // Extract problem information based on platform
    const hostname = window.location.hostname;
    let id = 'unknown';
    let title = 'Unknown Problem';
    let difficulty = 'unknown';

    if (hostname.includes('leetcode.com')) {
      const urlMatch = window.location.pathname.match(/problems\/([^/]+)/);
      const slug = urlMatch?.[1] || 'unknown';
      id = `leetcode_${slug}`;

      // IMPROVED TITLE SELECTORS
      const titleElement = document.querySelector('[data-cy="question-title"]') ||
        document.querySelector('.text-title-large') ||
        document.querySelector('.css-v3d350') ||
        document.querySelector('div[class*="title"]');

      title = titleElement?.textContent?.trim() || 'LeetCode Problem';
    } else if (hostname.includes('geeksforgeeks.org')) {
      const titleElement = document.querySelector('.problem-statement h1') ||
        document.querySelector('.gfg_h1');
      title = titleElement?.textContent?.trim() || 'GeeksforGeeks Problem';
      id = `gfg_${title.toLowerCase().replace(/\s+/g, '_')}`;
    }

    return {
      id,
      title,
      difficulty,
      platform: hostname
    };
  }

  private extractProblemDetails(): ExtractedProblem {
    const info = this.extractProblemInfo();
    let description = '';
    let constraints = '';

    // PLATFORM SPECIFIC SCRAPING
    if (window.location.hostname.includes('leetcode.com')) {
      // Improved LeetCode selectors
      const descElement = document.querySelector('[data-track-load="description_content"]') ||
        document.querySelector('.xFuwe') ||
        document.querySelector('.elfjS') ||
        document.querySelector('.question-content') ||
        document.querySelector('div[class*="description"]');

      if (descElement) {
        description = descElement.textContent || '';
      }
    }

    // Fallback: Basic description scraping
    if (!description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) description = metaDesc.getAttribute('content') || '';
    }

    const problem = {
      platform: info.platform,
      title: info.title,
      description: description.trim(),
      difficulty: info.difficulty,
      constraints: constraints,
      url: this.getPageUrl()
    };

    console.log('CAPTURED PROBLEM DETAILS:', problem);
    return problem;
  }

  private extractAndSendProblem() {
    const problem = this.extractProblemDetails();
    // Only send if we have at least a title or valid platform
    if (problem.platform !== 'unknown') {
      console.log('Detected problem, sending to background:', problem);
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROBLEM',
        data: problem
      });
    }
  }

  private observePageChanges() {
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        console.log('URL changed, re-detecting problem');
        this.extractAndSendProblem();

        // Also re-trigger finding editor as it might have changed
        this.findCodeEditor();
      }
    }, 1000);
  }

  private startPolling() {
    setInterval(() => {
      this.captureSignal(false);
    }, 3000);
  }

  private detectLanguage(): string {
    // Try to detect programming language from editor or page
    const code = this.currentEditor?.getValue() || '';

    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('public class') || code.includes('import java')) return 'java';
    if (code.includes('#include') || code.includes('using namespace')) return 'cpp';
    if (code.includes('package ') || code.includes('func ')) return 'go';

    return 'unknown';
  }

  // Monitor for successful submissions via URL-based detection.
  // LeetCode navigates to /problems/<slug>/submissions/<id>/ when a submission is accepted.
  // This is far more reliable than scanning document.body.innerText, which fires for every
  // DOM mutation and every table row that says "Accepted".
  private observeSubmissions() {
    let lastCheckedUrl = '';

    const checkForAcceptedResult = () => {
      if (this.hasLoggedCompletion) return;
      const url = window.location.href;

      // ── LeetCode: only check on /submissions/<id>/ URLs ──────────────────────
      if (window.location.hostname.includes('leetcode.com')) {
        const isSubmissionResultPage = /\/problems\/[^/]+\/submissions\/\d+/.test(url);
        if (!isSubmissionResultPage) return;
        if (url === lastCheckedUrl) return; // already processed this URL

        // Wait for the result element to render (React async)
        const successEl =
          document.querySelector('[data-e2e-locator="submission-result"]') ||
          document.querySelector('.text-green-s');

        if (successEl && successEl.textContent?.trim().toLowerCase() === 'accepted') {
          lastCheckedUrl = url;
          this.handleSuccessfulSubmission();
        }
      }

      // ── GeeksForGeeks: look for the success banner ────────────────────────────
      if (window.location.hostname.includes('geeksforgeeks.org')) {
        if (url === lastCheckedUrl) return;
        const banner = document.querySelector('.problems-submission-result');
        if (banner && banner.textContent?.toLowerCase().includes('problem solved successfully')) {
          lastCheckedUrl = url;
          this.handleSuccessfulSubmission();
        }
      }
    };

    // Poll every 2 seconds — lightweight, no DOM observer overhead.
    setInterval(checkForAcceptedResult, 2000);
  }

  private handleSuccessfulSubmission() {
    if (this.hasLoggedCompletion) return;
    this.hasLoggedCompletion = true;
    console.log('🏆 Problem Accepted! Sending to Backend Tracking.');

    const problemDetails = this.extractProblemDetails();

    // Extract problem slug and difficulty from the page
    const hostname = window.location.hostname;
    let platform = 'LEETCODE';
    let problemId = problemDetails.title || 'Unknown Problem';
    let difficulty = 'Medium';

    if (hostname.includes('leetcode.com')) {
      platform = 'LEETCODE';
      // Extract slug from URL: /problems/<slug>/submissions/<id>/
      const slugMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
      if (slugMatch) problemId = slugMatch[1]; // e.g. "check-if-array-is-sorted-and-rotated"

      // Extract difficulty from the difficulty badge on the page
      const diffEl =
        document.querySelector('[class*="text-difficulty-easy"]') ||
        document.querySelector('[class*="text-difficulty-medium"]') ||
        document.querySelector('[class*="text-difficulty-hard"]') ||
        document.querySelector('.text-olive') ||
        document.querySelector('.text-yellow') ||
        document.querySelector('.text-red') ||
        document.querySelector('[class*="difficulty"]');

      if (diffEl) {
        const diffText = diffEl.textContent?.trim().toLowerCase() || '';
        if (diffText.includes('easy')) difficulty = 'Easy';
        else if (diffText.includes('hard')) difficulty = 'Hard';
        else difficulty = 'Medium';
      }
    } else if (hostname.includes('geeksforgeeks.org')) {
      platform = 'GEEKSFORGEEKS';
      problemId = this.getProblemKeyFromUrl(window.location.href);
    }

    chrome.storage.local.get(['codementor_handle'], (result) => {
      const handle = result.codementor_handle || 'anonymous';

      const attemptData = {
        handle,
        platform,
        problemId,
        difficulty,
        hintsUsed: 0,
        completed: true
      };

      console.log('Logging attempt:', attemptData);
      chrome.runtime.sendMessage({
        type: 'LOG_PROBLEM_ATTEMPT',
        data: attemptData
      });

      const historyKey = this.getProblemKeyFromUrl(window.location.href);
      chrome.storage.local.get(['problemHintDepthMap', 'problemHintHistoryMap'], (store) => {
        const depthMap = store.problemHintDepthMap || {};
        const historyMap = store.problemHintHistoryMap || {};
        delete depthMap[historyKey];
        delete historyMap[historyKey];
        chrome.storage.local.set({
          problemHintDepthMap: depthMap,
          problemHintHistoryMap: historyMap,
          latestHints: [],
          activeHintProblemId: null
        });
      });
    });

    // Reset lock after 5 minutes (much longer than before to prevent rapid re-fires)
    // but still allow a second problem to be tracked in the same session.
    setTimeout(() => {
      this.hasLoggedCompletion = false;
    }, 5 * 60 * 1000);
  }

}

// Initialize the content script
new CodeCaptureService();

export { };
