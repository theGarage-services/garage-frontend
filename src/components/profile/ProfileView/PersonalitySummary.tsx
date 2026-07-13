import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Brain, ArrowRight } from 'lucide-react';
import { getMyPersonalityTestResult, type PersonalityTestResult } from '@/api/personalityTest';

interface PersonalitySummaryProps {
  onViewDetails: () => void;
}

export function PersonalitySummary({ onViewDetails }: Readonly<PersonalitySummaryProps>) {
  const [result, setResult] = useState<PersonalityTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await getMyPersonalityTestResult();
        if (data.completed && data.result) {
          setResult(data.result);
        }
      } catch {
        // Fail silently in the overview; the full tab will show any real error.
      } finally {
        setLoading(false);
      }
    };
    void loadResult();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="font-semibold text-gray-900">Personality</h3>
        </div>
        <p className="text-sm text-gray-500">Loading personality summary...</p>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-[#ff6b35]" />
              <h3 className="font-semibold text-gray-900">Personality Test</h3>
            </div>
            <p className="text-sm text-gray-600">
              Discover your Big Five traits and strengthen your profile.
            </p>
          </div>
          <Button size="sm" onClick={onViewDetails} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
            Take Test
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  const rankedTraits = [...result.trait_scores].sort((a, b) => a.rank - b.rank);
  const topTrait = rankedTraits[0];
  // trait_scores always contains the five Big Five traits, so .at(-1) is guaranteed to return a value.
  const lowestTrait = rankedTraits.at(-1)!;

  return (
    <Card className="p-6 bg-white/80 border-orange-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[#ff6b35]" />
            <h3 className="font-semibold text-gray-900">Personality Snapshot</h3>
          </div>
          <p className="text-sm text-gray-600">
            Your top trait is <strong>{topTrait.trait}</strong> ({topTrait.trait_std.toFixed(2)}/10)
            and your lowest is <strong>{lowestTrait.trait}</strong> ({lowestTrait.trait_std.toFixed(2)}/10).
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onViewDetails}
          className="border-orange-200 text-[#ff6b35] hover:bg-orange-50 self-start sm:self-auto shrink-0"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="space-y-3">
        {rankedTraits.map((trait) => (
          <div key={trait.trait}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mb-1">
              <span className="font-medium text-gray-800">
                {trait.rank}. {trait.trait}
              </span>
              <span className="text-gray-600">{trait.trait_std.toFixed(2)}/10</span>
            </div>
            <Progress
              value={Math.max(0, Math.min(100, trait.trait_pct))}
              className="h-2 bg-orange-100"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
