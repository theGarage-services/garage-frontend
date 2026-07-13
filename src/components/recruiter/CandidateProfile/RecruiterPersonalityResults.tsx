import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Brain, Loader2 } from 'lucide-react';
import { PersonalityResults } from '../../profile/ProfileView/PersonalityResults';
import {
  getCandidatePersonalityTestResult,
  type PersonalityTestResult,
} from '@/api/personalityTest';

interface RecruiterPersonalityResultsProps {
  candidateProfileId: number | null | undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Failed to load personality results.';
}

export function RecruiterPersonalityResults({
  candidateProfileId,
}: Readonly<RecruiterPersonalityResultsProps>) {
  const [result, setResult] = useState<PersonalityTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateProfileId) {
      setLoading(false);
      return;
    }

    const loadResult = async () => {
      try {
        const data = await getCandidatePersonalityTestResult(candidateProfileId);
        if (data.completed && data.result) {
          setResult(data.result);
        } else {
          setResult(null);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadResult();
  }, [candidateProfileId]);

  if (loading) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="font-semibold text-gray-900">Personality</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading personality results...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="font-semibold text-gray-900">Personality</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="font-semibold text-gray-900">Personality</h3>
        </div>
        <p className="text-sm text-gray-600">
          This candidate has not completed the personality test yet.
        </p>
      </Card>
    );
  }

  return (
    <PersonalityResults
      result={result}
      title="Candidate's Big Five Personality Profile"
    />
  );
}
