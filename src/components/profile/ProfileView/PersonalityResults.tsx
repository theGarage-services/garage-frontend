import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Brain, RefreshCw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import type { PersonalityTestResult, FacetScore } from '@/api/personalityTest';

interface PersonalityResultsProps {
  result: PersonalityTestResult;
  onRetake?: () => void;
  title?: string;
}

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  openness: 'Openness to Experience — appreciation for art, emotion, adventure, unusual ideas, imagination, curiosity, and variety of experience.',
  conscientiousness: 'Conscientiousness — tendency to be organized, dependable, show self-discipline, act dutifully, and aim for achievement.',
  extraversion: 'Extraversion — energy, positive emotions, assertiveness, sociability, and the tendency to seek stimulation and company.',
  agreeableness: 'Agreeableness — tendency to be compassionate, cooperative, and trusting rather than suspicious or antagonistic.',
  neuroticism: 'Neuroticism — tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, or vulnerability.',
};

const FACET_DESCRIPTIONS: Record<string, string> = {
  'Neuroticism|Anxiety': 'Tendency to feel nervous, worried, or on edge; sensitivity to potential threats and uncertainty.',
  'Neuroticism|Anger': 'Proneness to irritation and resentment when treated unfairly; intensity of hostile reactions.',
  'Neuroticism|Depression': 'Inclination toward low mood, discouragement, and reduced energy or motivation.',
  'Neuroticism|Self Consciousness': 'Sensitivity to others\' opinions; discomfort in social spotlight and fear of embarrassment.',
  'Neuroticism|Immoderation': 'Difficulty resisting temptations and impulses; preference for immediate rewards over long-term plans.',
  'Neuroticism|Vulnerability': 'Tendency to feel overwhelmed or helpless under stress and to struggle with clear thinking in crises.',

  'Extraversion|Friendliness': 'Warmth and ease in forming social bonds; openness and positive regard toward others.',
  'Extraversion|Gregariousness': 'Enjoyment of crowds and group activities; preference for social stimulation and company.',
  'Extraversion|Assertiveness': 'Comfort taking charge, speaking up, and directing group activities when needed.',
  'Extraversion|Activity Level': 'Preference for a busy, fast-paced lifestyle and frequent engagement in activities.',
  'Extraversion|Excitement Seeking': 'Desire for thrills, novelty, and high-stimulation experiences.',
  'Extraversion|Cheerfulness': 'Tendency to experience positive moods, optimism, and an upbeat emotional tone.',

  'Openness|Imagination': 'Rich inner life and preference for fantasy, creative thinking, and novel ideas.',
  'Openness|Artistic Interests': 'Appreciation for art, beauty, and aesthetic experiences across media.',
  'Openness|Emotionality': 'Awareness of and comfort with one’s own emotions and emotional expression.',
  'Openness|Adventurousness': 'Willingness to try new activities, travel, and embrace variety over routine.',
  'Openness|Intellect': 'Curiosity about abstract ideas, enjoyment of intellectual challenges and problem solving.',
  'Openness|Liberalism': 'Openness to change and nonconformity; readiness to question tradition and authority.',

  'Agreeableness|Trust': 'Tendency to assume others are honest and well-intentioned; giving others the benefit of the doubt.',
  'Agreeableness|Morality': 'Preference for candid, ethical behavior and reluctance to manipulate or deceive others.',
  'Agreeableness|Altruism': 'Genuine satisfaction from helping others and willingness to act for others’ benefit.',
  'Agreeableness|Cooperation': 'Inclination to seek compromise, work collaboratively, and preserve group harmony.',
  'Agreeableness|Modesty': 'Tendency to downplay achievements and avoid boasting; valuing humility.',
  'Agreeableness|Sympathy': 'Capacity for empathy and emotional concern for people who are suffering.',

  'Conscientiousness|Self Efficacy': 'Confidence in one’s ability to accomplish goals and handle challenges effectively.',
  'Conscientiousness|Orderliness': 'Preference for tidy, organized environments and predictable routines.',
  'Conscientiousness|Dutifulness': 'Strong sense of responsibility and commitment to obligations and rules.',
  'Conscientiousness|Achievement Striving': 'Drive to set high standards, pursue goals, and achieve recognition.',
  'Conscientiousness|Self Discipline': 'Ability to persist on tasks, resist distractions, and follow through on plans.',
  'Conscientiousness|Cautiousness': 'Tendency to think carefully, weigh consequences, and avoid hasty decisions.',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function normalizeTraitName(trait: string): string {
  return trait.toLowerCase().trim();
}

function lookupFacetDescription(trait: string, facet: string): string {
  return FACET_DESCRIPTIONS[`${trait}|${facet}`] || `Your score for the ${facet} facet.`;
}

function getTraitInterpretation(trait: string, traitStd: number): string {
  if (traitStd >= 8) {
    return `High on ${trait} — this suggests consistent tendencies aligned with this trait.`;
  }
  if (traitStd >= 5) {
    return `Moderate level of ${trait} — balanced tendencies.`;
  }
  return `Lower level of ${trait} — less pronounced tendencies in this domain.`;
}

function getTraitSuggestions(traitStd: number): string[] {
  if (traitStd >= 8) {
    return [
      'Leverage this strength in roles and tasks that reward it.',
      'Be mindful of overuse; consider delegation where appropriate.',
    ];
  }
  if (traitStd >= 5) {
    return [
      'Maintain balance; use complementary strategies to strengthen weaker facets.',
    ];
  }
  return [
    'Consider targeted development activities to build capability in this area.',
  ];
}

function getTraitIcon(traitStd: number) {
  if (traitStd >= 8) return <TrendingUp className="w-5 h-5 text-green-600" />;
  if (traitStd >= 5) return <Sparkles className="w-5 h-5 text-[#ff6b35]" />;
  return <TrendingDown className="w-5 h-5 text-blue-500" />;
}

export function PersonalityResults({ result, onRetake, title }: Readonly<PersonalityResultsProps>) {
  const rankedTraits = [...result.trait_scores].sort((a, b) => a.rank - b.rank);
  const topTrait = rankedTraits[0];
  const lowestTrait = rankedTraits.at(-1)!; // Assert non-null since trait_scores always has at least one entry

  const getFacetsForTrait = (trait: string): FacetScore[] => {
    return result.facet_scores
      .filter((f) => f.trait === trait)
      .sort((a, b) => b.facet_pct - a.facet_pct);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-[#ff6b35]" />
              <h3 className="text-lg font-semibold text-gray-900">{title || 'Your Big Five Personality Profile'}</h3>
            </div>
            <p className="text-sm text-gray-500">
              Completed on {formatDate(result.completed_at)}
            </p>
          </div>
          {onRetake && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetake}
              className="border-orange-200 text-[#ff6b35] hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Test
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-white/80 border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top strengths & development</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-700">Top trait</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {topTrait.trait} — {topTrait.trait_std.toFixed(2)} / 10
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {TRAIT_DESCRIPTIONS[normalizeTraitName(topTrait.trait)] || `Your score for ${topTrait.trait}.`}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-gray-700">Lowest trait</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {lowestTrait.trait} — {lowestTrait.trait_std.toFixed(2)} / 10
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {TRAIT_DESCRIPTIONS[normalizeTraitName(lowestTrait.trait)] || `Your score for ${lowestTrait.trait}.`}
            </p>
          </div>
        </div>
        <ul className="mt-6 space-y-2">
          {rankedTraits.slice(0, 3).map((trait) => (
            <li key={trait.trait} className="text-sm text-gray-700">
              <strong>{trait.trait}:</strong> Strength — consider roles and tasks that leverage this.
            </li>
          ))}
        </ul>
      </Card>

      {rankedTraits.map((trait) => {
        const traitFacets = getFacetsForTrait(trait.trait);
        return (
          <Card key={trait.trait} className="p-6 bg-white/80 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                {getTraitIcon(trait.trait_std)}
                <h3 className="text-lg font-semibold text-gray-900">{trait.trait}</h3>
                <span className="text-xs text-white bg-[#ff6b35] px-2 py-0.5 rounded-full">
                  #{trait.rank}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {trait.trait_std.toFixed(2)} / 10 ({trait.trait_pct.toFixed(0)}%)
              </span>
            </div>

            <Progress
              value={Math.max(0, Math.min(100, trait.trait_pct))}
              className="h-2 bg-orange-100 mb-3"
            />

            <p className="text-sm text-gray-700 mb-3">
              {TRAIT_DESCRIPTIONS[normalizeTraitName(trait.trait)] || `What ${trait.trait} covers for you.`}
            </p>

            <p className="text-sm text-gray-600 mb-5">
              {getTraitInterpretation(trait.trait, trait.trait_std)}
            </p>

            <h4 className="text-sm font-semibold text-gray-900 mb-3">Facets</h4>
            <div className="space-y-4 mb-5">
              {traitFacets.map((facet) => (
                <div key={facet.facet}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mb-1">
                    <span className="font-medium text-gray-800">{facet.facet}</span>
                    <span className="text-gray-600">{facet.facet_std.toFixed(2)} / 10</span>
                  </div>
                  <Progress
                    value={Math.max(0, Math.min(100, facet.facet_pct))}
                    className="h-1.5 bg-orange-100 mb-1"
                  />
                  <p className="text-xs text-gray-500">
                    {lookupFacetDescription(trait.trait, facet.facet)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Practical suggestions</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {getTraitSuggestions(trait.trait_std).map((suggestion) => (
                  <li key={`${trait.trait}-${suggestion}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </Card>
        );
      })}

      <p className="text-xs text-gray-500 text-center">
        Scoring: each facet is the mean of 5 items (1–5). Trait = mean of 6 facets. Standardized score = trait × 2 (range 2–10). This report is based on self-report questionnaire data and is intended for personal insight only.
      </p>
    </div>
  );
}
