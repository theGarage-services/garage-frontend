import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Brain, ChevronRight, Loader2 } from 'lucide-react';
import { PersonalityTest } from './PersonalityTest';
import { PersonalityResults } from './PersonalityResults';
import {
  getMyPersonalityTestResult,
  type PersonalityTestResult,
} from '@/api/personalityTest';

interface PersonalityTabProps {
  onComplete?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export function PersonalityTab({ onComplete }: Readonly<PersonalityTabProps>) {
  const [result, setResult] = useState<PersonalityTestResult | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResult = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPersonalityTestResult();
      setCompleted(data.completed);
      setResult(data.result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResult();
  }, [loadResult]);

  const handleTestComplete = useCallback(async () => {
    setShowTest(false);
    await loadResult();
    onComplete?.();
  }, [loadResult, onComplete]);

  if (loading) {
    return (
      <Card className="p-8 bg-white/80 border-orange-100 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35] mx-auto mb-4" />
        <p className="text-gray-600">Loading your personality profile...</p>
      </Card>
    );
  }

  if (showTest) {
    return (
      <PersonalityTest
        onComplete={handleTestComplete}
        onCancel={() => setShowTest(false)}
      />
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-white/80 border-orange-100 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => void loadResult()} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
          Try Again
        </Button>
      </Card>
    );
  }

  if (completed && result) {
    return <PersonalityResults result={result} onRetake={() => setShowTest(true)} />;
  }

  return (
    <Card className="p-8 bg-white/80 border-orange-100 text-center">
      <div className="max-w-[95vw] sm:max-w-md mx-auto">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-[#ff6b35]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Discover Your Work Style
        </h3>
        <p className="text-gray-600 mb-6">
          Complete our 150-question Big Five personality assessment to help employers
          understand how you work and to strengthen your profile.
        </p>
        <Button
          size="lg"
          onClick={() => setShowTest(true)}
          className="bg-[#ff6b35] hover:bg-[#e55a2b]"
        >
          Take the Test
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
