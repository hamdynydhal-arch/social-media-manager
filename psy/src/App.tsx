import { useState, useEffect } from 'react';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import InstallPromptBanner from './components/InstallPromptBanner';
import type { TestResult } from './engine/types';
import type { AttachmentResult } from './engine/attachmentTypes';
import type { SchemaResult } from './engine/schemaTypes';
import { buildTestResult, saveResult } from './engine/scoring';
import { calculateAttachmentScores, saveAttachmentResult } from './engine/attachmentScoring';
import { calculateSchemaScores, saveSchemaResult } from './engine/schemaScoring';
import bigfiveData from './data/bigfive.json';
import bigfiveContent from './data/bigfiveContent';
import attachmentData from './data/attachment.json';
import attachmentContent from './data/attachmentContent';
import schemaData from './data/schema.json';
import schemaContent from './data/schemaContent';
import type { SchemaQuestion } from './engine/schemaTypes';
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import AttachmentStartPage from './pages/AttachmentStartPage';
import AttachmentTestPage from './pages/AttachmentTestPage';
import AttachmentResultPage from './pages/AttachmentResultPage';
import SchemaStartPage from './pages/SchemaStartPage';
import SchemaTestPage from './pages/SchemaTestPage';
import SchemaResultPage from './pages/SchemaResultPage';
import SynthesisPage from './pages/SynthesisPage';
import IntakePage from './pages/IntakePage';
import SettingsPage from './pages/SettingsPage';

type AppView = 'home' | 'ocean' | 'attachment' | 'schema' | 'synthesis' | 'intake' | 'settings';
type OceanPage = 'start' | 'test' | 'result';
type AttachmentPhase = 'start' | 'test';
type SchemaPhase = 'start' | 'test';

export default function App() {
  const { showBanner, handleInstall, handleDismiss } = useInstallPrompt();
  const [appView, setAppView] = useState<AppView>('home');

  // Restore font size preference on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nafees_font_size');
      if (saved) document.documentElement.style.fontSize = saved;
    } catch {}
  }, []);

  // OCEAN sub-state — unchanged from before
  const [oceanPage, setOceanPage] = useState<OceanPage>('start');
  const [oceanResult, setOceanResult] = useState<TestResult | null>(null);

  // Attachment sub-state
  const [attachmentPhase, setAttachmentPhase] = useState<AttachmentPhase>('start');
  const [attachmentResult, setAttachmentResult] = useState<AttachmentResult | null>(null);

  // Schema sub-state
  const [schemaPhase, setSchemaPhase] = useState<SchemaPhase>('start');
  const [schemaResult, setSchemaResult] = useState<SchemaResult | null>(null);

  // ── Home ──────────────────────────────────────────────
  function handleSelectOcean() {
    setOceanPage('start');
    setAppView('ocean');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectAttachment() {
    setAttachmentResult(null);
    setAttachmentPhase('start');
    setAppView('attachment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectSchema() {
    setSchemaResult(null);
    setSchemaPhase('start');
    setAppView('schema');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectSynthesis() {
    setAppView('synthesis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectIntake() {
    setAppView('intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectSettings() {
    setAppView('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleIntakeComplete() {
    setAppView('synthesis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    setAppView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── OCEAN flow ────────────────────────────────────────
  function handleOceanStart() {
    setOceanPage('test');
  }

  function handleOceanComplete(answers: Record<string, number>) {
    const base = buildTestResult(answers, bigfiveData.questions as never, bigfiveData.scoring as never);
    const testResult: TestResult = { testId: bigfiveData.id, ...base };
    saveResult(testResult);
    setOceanResult(testResult);
    setOceanPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOceanReset() {
    setOceanResult(null);
    setOceanPage('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOceanRetake() {
    setOceanResult(null);
    setOceanPage('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Attachment flow ───────────────────────────────────
  function handleAttachmentComplete(answers: Record<string, number>) {
    const result = calculateAttachmentScores(
      answers,
      attachmentData.questions as never,
      attachmentData.likertMin,
      attachmentData.likertMax
    );
    saveAttachmentResult(result);
    setAttachmentResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAttachmentReset() {
    setAttachmentResult(null);
    setAttachmentPhase('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAttachmentRetake() {
    setAttachmentResult(null);
    setAttachmentPhase('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Schema flow ───────────────────────────────────────
  function handleSchemaComplete(answers: Record<string, number>) {
    const result = calculateSchemaScores(
      answers,
      schemaData.questions as SchemaQuestion[],
      schemaData.likertMin,
      schemaData.likertMax,
    );
    saveSchemaResult(result);
    setSchemaResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSchemaReset() {
    setSchemaResult(null);
    setSchemaPhase('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSchemaRetake() {
    setSchemaResult(null);
    setSchemaPhase('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Render ─────────────────────────────────────────────
  function renderPage() {
    if (appView === 'home') {
      return (
        <HomePage
          onSelectOcean={handleSelectOcean}
          onSelectAttachment={handleSelectAttachment}
          onSelectSchema={handleSelectSchema}
          onSelectSynthesis={handleSelectSynthesis}
          onSelectSettings={handleSelectSettings}
          onSelectIntake={handleSelectIntake}
        />
      );
    }

    if (appView === 'ocean') {
      return (
        <>
          {oceanPage === 'start' && (
            <StartPage
              testName={bigfiveData.name}
              description={bigfiveData.description}
              estimatedMinutes={bigfiveData.estimatedMinutes}
              questionCount={bigfiveData.questions.length}
              onStart={handleOceanStart}
              onHome={goHome}
              disclaimer={bigfiveContent.disclaimer}
            />
          )}
          {oceanPage === 'test' && (
            <TestPage
              questions={bigfiveData.questions as never}
              onComplete={handleOceanComplete}
              onReset={handleOceanReset}
            />
          )}
          {oceanPage === 'result' && oceanResult && (
            <ResultPage
              result={oceanResult}
              content={bigfiveContent}
              onRetake={handleOceanRetake}
            />
          )}
        </>
      );
    }

    if (appView === 'attachment') {
      if (attachmentResult) {
        return (
          <AttachmentResultPage
            result={attachmentResult}
            content={attachmentContent}
            onRetake={handleAttachmentRetake}
            onHome={goHome}
          />
        );
      }
      if (attachmentPhase === 'start') {
        return (
          <AttachmentStartPage
            questionCount={attachmentData.questions.length}
            estimatedMinutes={attachmentData.estimatedMinutes}
            disclaimer={attachmentContent.disclaimer}
            onStart={() => { setAttachmentPhase('test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onHome={goHome}
          />
        );
      }
      return (
        <AttachmentTestPage
          questions={attachmentData.questions as never}
          onComplete={handleAttachmentComplete}
          onReset={handleAttachmentReset}
          onHome={goHome}
        />
      );
    }

    if (appView === 'schema') {
      if (schemaResult) {
        return (
          <SchemaResultPage
            result={schemaResult}
            content={schemaContent}
            onRetake={handleSchemaRetake}
            onHome={goHome}
          />
        );
      }
      if (schemaPhase === 'start') {
        return (
          <SchemaStartPage
            questionCount={schemaData.questions.length}
            estimatedMinutes={schemaData.estimatedMinutes}
            disclaimer={schemaContent.disclaimer}
            onStart={() => { setSchemaPhase('test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onHome={goHome}
          />
        );
      }
      return (
        <SchemaTestPage
          questions={schemaData.questions as SchemaQuestion[]}
          onComplete={handleSchemaComplete}
          onReset={handleSchemaReset}
          onHome={goHome}
        />
      );
    }

    if (appView === 'synthesis') {
      return <SynthesisPage onHome={goHome} />;
    }

    if (appView === 'intake') {
      return <IntakePage onHome={goHome} onComplete={handleIntakeComplete} />;
    }

    if (appView === 'settings') {
      return <SettingsPage onHome={goHome} onSelectIntake={handleSelectIntake} />;
    }

    return null;
  }

  return (
    <>
      {renderPage()}
      {showBanner && (
        <InstallPromptBanner onInstall={handleInstall} onDismiss={handleDismiss} />
      )}
      {/* Fixed global nav — always visible on every screen, z-50 ensures it's on top */}
      <div
        className="fixed top-3 right-3 z-50 flex items-center gap-2"
        dir="rtl"
      >
        <button
          onClick={handleSelectSettings}
          className="flex items-center gap-1.5 bg-nafees-navy text-nafees-cream border border-white/40 px-3 py-2 rounded-full text-xs font-bold shadow-xl active:scale-95 transition-transform duration-150"
          aria-label="الإعدادات"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          الإعدادات
        </button>
        <button
          onClick={handleSelectIntake}
          className="flex items-center gap-1.5 bg-nafees-navy text-nafees-cream border border-white/40 px-3 py-2 rounded-full text-xs font-bold shadow-xl active:scale-95 transition-transform duration-150"
          aria-label="ملفي السياقي"
        >
          👤
        </button>
      </div>
    </>
  );
}
