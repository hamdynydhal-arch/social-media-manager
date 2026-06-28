import { useState } from 'react';
import type { TestResult } from './engine/types';
import { buildTestResult, saveResult } from './engine/scoring';
import bigfiveData from './data/bigfive.json';
import bigfiveContent from './data/bigfiveContent';
import StartPage from './pages/StartPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';

type Page = 'start' | 'test' | 'result';

export default function App() {
  const [page, setPage] = useState<Page>('start');
  const [result, setResult] = useState<TestResult | null>(null);

  function handleStart() {
    setPage('test');
  }

  function handleComplete(answers: Record<string, number>) {
    const base = buildTestResult(answers, bigfiveData.questions as never, bigfiveData.scoring as never);
    const testResult: TestResult = { testId: bigfiveData.id, ...base };
    saveResult(testResult);
    setResult(testResult);
    setPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleRetake() {
    setResult(null);
    setPage('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {page === 'start' && (
        <StartPage
          testName={bigfiveData.name}
          description={bigfiveData.description}
          estimatedMinutes={bigfiveData.estimatedMinutes}
          questionCount={bigfiveData.questions.length}
          onStart={handleStart}
          disclaimer={bigfiveContent.disclaimer}
        />
      )}
      {page === 'test' && (
        <TestPage
          questions={bigfiveData.questions as never}
          onComplete={handleComplete}
        />
      )}
      {page === 'result' && result && (
        <ResultPage
          result={result}
          content={bigfiveContent}
          onRetake={handleRetake}
        />
      )}
    </>
  );
}
