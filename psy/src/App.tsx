import { useState, useEffect } from 'react';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import InstallPromptBanner from './components/InstallPromptBanner';
import type { TestResult, OceanTier } from './engine/types';
import type { AttachmentResult } from './engine/attachmentTypes';
import type { SchemaResult } from './engine/schemaTypes';
import type { SocialPatternsResult } from './engine/socialPatternsTypes';
import { buildTestResult, saveResult } from './engine/scoring';
import { calculateAttachmentScores, saveAttachmentResult } from './engine/attachmentScoring';
import { calculateSchemaScores, saveSchemaResult } from './engine/schemaScoring';
import { calculateSocialPatternsScores, saveSocialPatternsResult } from './engine/socialPatternsScoring';
import bigfiveData from './data/bigfive.json';
import bigfiveContent from './data/bigfiveContent';
import attachmentData from './data/attachment.json';
import attachmentContent from './data/attachmentContent';
import schemaData from './data/schema.json';
import schemaContent from './data/schemaContent';
import socialPatternsData from './data/socialPatterns.json';
import type { SchemaQuestion } from './engine/schemaTypes';
import type { SocialPatternsQuestion } from './engine/socialPatternsTypes';
import AppNavbar from './components/AppNavbar';
import InProgressBanner from './components/InProgressBanner';
import OceanTierModal from './components/OceanTierModal';
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
import SocialPatternsStartPage from './pages/SocialPatternsStartPage';
import SocialPatternsTestPage from './pages/SocialPatternsTestPage';
import SocialPatternsResultPage from './pages/SocialPatternsResultPage';
import SynthesisPage from './pages/SynthesisPage';
import IntakePage from './pages/IntakePage';
import SettingsPage from './pages/SettingsPage';

type AppView = 'home' | 'ocean' | 'attachment' | 'schema' | 'social_patterns' | 'synthesis' | 'intake' | 'settings';
type OceanPage = 'start' | 'test' | 'result';
type AttachmentPhase = 'start' | 'test';
type SchemaPhase = 'start' | 'test';
type SocialPatternsPhase = 'start' | 'test';

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

  // OCEAN sub-state
  const [oceanPage, setOceanPage] = useState<OceanPage>('start');
  const [oceanResult, setOceanResult] = useState<TestResult | null>(null);
  const [oceanTier, setOceanTier] = useState<OceanTier>('deep');
  const [showTierModal, setShowTierModal] = useState(false);

  // Attachment sub-state
  const [attachmentPhase, setAttachmentPhase] = useState<AttachmentPhase>('start');
  const [attachmentResult, setAttachmentResult] = useState<AttachmentResult | null>(null);

  // Schema sub-state
  const [schemaPhase, setSchemaPhase] = useState<SchemaPhase>('start');
  const [schemaResult, setSchemaResult] = useState<SchemaResult | null>(null);

  // Social Patterns sub-state
  const [socialPatternsPhase, setSocialPatternsPhase] = useState<SocialPatternsPhase>('start');
  const [socialPatternsResult, setSocialPatternsResult] = useState<SocialPatternsResult | null>(null);

  // ── Home ──────────────────────────────────────────────
  function handleSelectOcean() {
    setOceanPage('start');
    setOceanResult(null);
    setShowTierModal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleTierSelect(tier: OceanTier) {
    setOceanTier(tier);
    setShowTierModal(false);
    setAppView('ocean');
  }

  function handleTierCancel() {
    setShowTierModal(false);
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

  function handleSelectSocialPatterns() {
    setSocialPatternsResult(null);
    setSocialPatternsPhase('start');
    setAppView('social_patterns');
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
    const activeQs = oceanTier === 'core'
      ? (bigfiveData.questions as { tier?: string }[]).filter((q) => q.tier === 'core')
      : bigfiveData.questions;
    const base = buildTestResult(answers, activeQs as never, bigfiveData.scoring as never, oceanTier);
    const testResult: TestResult = { testId: bigfiveData.id, ...base };
    saveResult(testResult);
    setOceanResult(testResult);
    setOceanPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOceanUpgrade() {
    setOceanTier('deep');
    setOceanResult(null);
    setOceanPage('start');
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

  // ── Social Patterns flow ──────────────────────────────
  function handleSocialPatternsComplete(answers: Record<string, number>) {
    const result = calculateSocialPatternsScores(
      answers,
      socialPatternsData.questions as SocialPatternsQuestion[],
      socialPatternsData.likertMin,
      socialPatternsData.likertMax,
    );
    saveSocialPatternsResult(result);
    setSocialPatternsResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSocialPatternsReset() {
    setSocialPatternsResult(null);
    setSocialPatternsPhase('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSocialPatternsRetake() {
    setSocialPatternsResult(null);
    setSocialPatternsPhase('start');
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

  // Determine if we're in an active test — test pages render their own progress bars
  const isTestPhase =
    (appView === 'ocean' && oceanPage === 'test') ||
    (appView === 'attachment' && !attachmentResult && attachmentPhase === 'test') ||
    (appView === 'schema' && !schemaResult && schemaPhase === 'test') ||
    (appView === 'social_patterns' && !socialPatternsResult && socialPatternsPhase === 'test');

  function getNavbarProps() {
    if (appView === 'home') return { isHome: true, onSettings: handleSelectSettings, onIntake: handleSelectIntake };
    if (appView === 'settings') return { onBack: goHome };
    return { onBack: goHome, onSettings: handleSelectSettings };
  }

  function renderPage() {
    if (appView === 'home') {
      return (
        <HomePage
          onSelectOcean={handleSelectOcean}
          onSelectAttachment={handleSelectAttachment}
          onSelectSchema={handleSelectSchema}
          onSelectSocialPatterns={handleSelectSocialPatterns}
          onSelectSynthesis={handleSelectSynthesis}
          onSelectSettings={handleSelectSettings}
          onSelectIntake={handleSelectIntake}
        />
      );
    }

    if (appView === 'ocean') {
      const activeOceanQs = oceanTier === 'core'
        ? (bigfiveData.questions as { tier?: string }[]).filter((q) => q.tier === 'core')
        : bigfiveData.questions;
      return (
        <>
          {oceanPage === 'start' && <InProgressBanner currentTestId="ocean" />}
          {oceanPage === 'start' && (
            <StartPage
              testName={bigfiveData.name}
              description={bigfiveData.description}
              estimatedMinutes={oceanTier === 'core' ? 6 : bigfiveData.estimatedMinutes}
              questionCount={activeOceanQs.length}
              onStart={handleOceanStart}
              onHome={goHome}
              disclaimer={bigfiveContent.disclaimer}
            />
          )}
          {oceanPage === 'test' && (
            <TestPage
              questions={activeOceanQs as never}
              onComplete={handleOceanComplete}
              onReset={handleOceanReset}
            />
          )}
          {oceanPage === 'result' && oceanResult && (
            <ResultPage
              result={oceanResult}
              content={bigfiveContent}
              onRetake={handleOceanRetake}
              onUpgrade={oceanResult.tier === 'core' ? handleOceanUpgrade : undefined}
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
          <>
            <InProgressBanner currentTestId="attachment" />
            <AttachmentStartPage
              questionCount={attachmentData.questions.length}
              estimatedMinutes={attachmentData.estimatedMinutes}
              disclaimer={attachmentContent.disclaimer}
              onStart={() => { setAttachmentPhase('test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onHome={goHome}
            />
          </>
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
          <>
            <InProgressBanner currentTestId="schema" />
            <SchemaStartPage
              questionCount={schemaData.questions.length}
              estimatedMinutes={schemaData.estimatedMinutes}
              disclaimer={schemaContent.disclaimer}
              onStart={() => { setSchemaPhase('test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onHome={goHome}
            />
          </>
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

    if (appView === 'social_patterns') {
      if (socialPatternsResult) {
        return (
          <SocialPatternsResultPage
            result={socialPatternsResult}
            onRetake={handleSocialPatternsRetake}
            onHome={goHome}
            onTakeOcean={handleSelectOcean}
          />
        );
      }
      if (socialPatternsPhase === 'start') {
        return (
          <>
            <InProgressBanner currentTestId="social_patterns" />
            <SocialPatternsStartPage
              questionCount={socialPatternsData.questions.length}
              estimatedMinutes={socialPatternsData.estimatedMinutes}
              onStart={() => { setSocialPatternsPhase('test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onHome={goHome}
            />
          </>
        );
      }
      return (
        <SocialPatternsTestPage
          questions={socialPatternsData.questions as SocialPatternsQuestion[]}
          onComplete={handleSocialPatternsComplete}
          onReset={handleSocialPatternsReset}
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
      {!isTestPhase && <AppNavbar {...getNavbarProps()} />}
      {renderPage()}
      {showBanner && (
        <InstallPromptBanner onInstall={handleInstall} onDismiss={handleDismiss} />
      )}
      {showTierModal && (
        <OceanTierModal onSelect={handleTierSelect} onCancel={handleTierCancel} />
      )}
    </>
  );
}
