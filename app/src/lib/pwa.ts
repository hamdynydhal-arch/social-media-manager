/**
 * PWA singleton — web-only.
 * Registers the `beforeinstallprompt` listener at module-load time,
 * BEFORE any React component mounts, so the event is never missed.
 *
 * Also reads `window.__pwaPrompt` which is pre-captured by an inline
 * script injected into index.html at build time (see deploy-web.yml).
 */

export type PWAState =
  | { type: 'unsupported' }        // native or already installed
  | { type: 'ios' }                // iOS Safari — needs manual instructions
  | { type: 'available'; prompt: () => Promise<'accepted' | 'dismissed'> }
  | { type: 'installed' };

// ── Module-level state ─────────────────────────────────────────────────────
let _deferred: any = null;
const _subscribers = new Set<() => void>();

function notify() { _subscribers.forEach(fn => fn()); }

// ── Detect iOS Safari ──────────────────────────────────────────────────────
function detectIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) &&
    /safari/i.test(ua) &&
    !/crios|fxios|chrome/i.test(ua)
  );
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// ── Register listener immediately on web ───────────────────────────────────
if (typeof window !== 'undefined') {
  // Pick up prompt pre-captured by the inline <script> in index.html
  if ((window as any).__pwaPrompt) {
    _deferred = (window as any).__pwaPrompt;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    _deferred = e;
    (window as any).__pwaPrompt = e;
    (window as any).deferredPrompt = e;
    notify();
  });
}

// ── Public API ─────────────────────────────────────────────────────────────
export function getPWAState(): PWAState {
  if (typeof window === 'undefined') return { type: 'unsupported' };
  if (isStandalone()) return { type: 'installed' };
  if (detectIosSafari()) return { type: 'ios' };
  if (_deferred) {
    return {
      type: 'available',
      prompt: async () => {
        _deferred.prompt();
        const { outcome } = await _deferred.userChoice;
        _deferred = null;
        notify();
        return outcome as 'accepted' | 'dismissed';
      },
    };
  }
  return { type: 'unsupported' };
}

export function subscribePWA(fn: () => void): () => void {
  _subscribers.add(fn);
  return () => _subscribers.delete(fn);
}

const DISMISSED_KEY = 'pwa_modal_dismissed';
export function isDashboardPromptDismissed(): boolean {
  try { return !!localStorage.getItem(DISMISSED_KEY); } catch { return false; }
}
export function dismissDashboardPrompt(): void {
  try { localStorage.setItem(DISMISSED_KEY, '1'); } catch {}
}
