import NafeesLogo from './NafeesLogo';

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

interface AppNavbarProps {
  isHome?: boolean;
  onBack?: () => void;
  onSettings?: () => void;
  onIntake?: () => void;
}

export default function AppNavbar({ isHome, onBack, onSettings, onIntake }: AppNavbarProps) {
  return (
    <header
      className="sticky top-0 z-40 bg-nafees-navy border-b border-white/10"
      dir="rtl"
    >
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">

        {/* Right slot (RTL start): brand icon on home, back button on sub-pages */}
        {isHome ? (
          <div className="flex items-center gap-2">
            <NafeesLogo size={26} />
            <span
              className="text-nafees-cream font-bold text-base"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', letterSpacing: '0.1em' }}
            >
              نَفيس
            </span>
          </div>
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-nafees-cream/75 hover:text-nafees-cream text-sm font-medium active:scale-95 transition-all duration-150 px-2 py-1.5 rounded-lg hover:bg-white/10 -mr-2"
          >
            ← رجوع
          </button>
        )}

        {/* Left slot (RTL end): action group */}
        <div className="flex items-center gap-2">
          {onIntake && (
            <button
              onClick={onIntake}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-nafees-cream text-xs font-semibold transition-all duration-200 active:scale-95"
            >
              ملفي
              <span className="text-sm leading-none">👤</span>
            </button>
          )}
          {onSettings && (
            <button
              onClick={onSettings}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-nafees-cream/75 hover:text-nafees-cream transition-all duration-200 active:scale-95"
              aria-label="الإعدادات"
            >
              <GearIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
