import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { TrendingUp, Target, Clock, Users, AlertCircle, Sparkles, Lightbulb, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import type { SimulationResult, ScoreBreakdown, ScenarioResult } from '../../api/careerSimulator';

interface SimulationResultCardProps {
  result: SimulationResult | null;
  milestones?: { completed: boolean }[];
  compact?: boolean;
}

const BREAKDOWN_LABELS: Record<keyof Omit<ScoreBreakdown, 'composite_score'>, string> = {
  semantic: 'Semantic Match',
  skill_coverage: 'Skill Coverage',
  experience: 'Experience',
  confidence: 'Confidence',
  education: 'Education',
  industry_alignment: 'Industry Alignment',
  level_alignment: 'Level Alignment',
};

function ScoreBreakdownView({ breakdown }: Readonly<{ breakdown?: ScoreBreakdown }>) {
  if (!breakdown) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      {(Object.keys(BREAKDOWN_LABELS) as Array<keyof typeof BREAKDOWN_LABELS>).map((key) => {
        const value = (breakdown[key] ?? 0) * 100;
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-gray-600">{BREAKDOWN_LABELS[key]}</span>
              <span className="font-medium text-gray-900">{value.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioCard({
  title,
  icon: Icon,
  colorClass,
  scenario,
  result,
}: Readonly<{
  title: string;
  icon: typeof Target;
  colorClass: string;
  scenario: ScenarioResult;
  result: SimulationResult;
}>) {
  const [expanded, setExpanded] = useState(false);
  const pct = scenario?.match_percentage ?? 0;

  return (
    <Card className="p-4 bg-white border-gray-200">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{pct.toFixed(0)}%</div>
      <div className="text-xs text-gray-500 mt-1">
        {scenario?.industry || result.current?.industry || 'Unknown'} • {scenario?.level || result.current?.level || 'Unknown'}
      </div>
      {scenario?.score_breakdown && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
        >
          {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
          {expanded ? 'Hide breakdown' : 'Score breakdown'}
        </Button>
      )}
      {expanded && <ScoreBreakdownView breakdown={scenario?.score_breakdown} />}
    </Card>
  );
}

function CompactSimulationResultCard({ result }: Readonly<{ result: SimulationResult }>) {
  const currentPct = result.current?.match_percentage ?? 0;
  const dreamPct = result.dream?.match_percentage ?? 0;
  const baselinePct = result.dream_baseline?.match_percentage ?? currentPct;
  const deltaPct = dreamPct - baselinePct;
  const gaps = result.skill_gaps?.gaps || [];
  const hasPathwayData = (result.skill_gaps?.required_skill_count ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">Baseline in this queue</div>
          <div className="text-xl font-bold text-blue-900">{baselinePct.toFixed(0)}%</div>
        </Card>
        <Card className="p-3 bg-orange-50 border-orange-200">
          <div className="text-xs text-orange-600 font-medium mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            With Additions
          </div>
          <div className="flex items-end gap-2">
            <div className="text-xl font-bold text-orange-900">{dreamPct.toFixed(0)}%</div>
            {deltaPct !== 0 && (
              <div className={`text-xs font-medium mb-1 ${deltaPct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%
              </div>
            )}
          </div>
        </Card>
      </div>

      {hasPathwayData ? (
        <div className="text-xs text-gray-600">
          {Math.min(result.skill_gaps?.candidate_skill_count ?? 0, result.skill_gaps?.required_skill_count ?? 0)} of {result.skill_gaps?.required_skill_count ?? 0} required skills covered
          {result.skill_gaps?.coverage != null && (
            <span className="ml-1 font-medium text-amber-700">
              ({(result.skill_gaps.coverage * 100).toFixed(0)}%)
            </span>
          )}
        </div>
      ) : (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          No skill pathway data available for this industry/level combination.
        </div>
      )}

      {gaps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Remaining Skill Gaps
          </h4>
          <div className="flex flex-wrap gap-1">
            {gaps.slice(0, 8).map((skill, idx) => {
              const skillName = Array.isArray(skill) ? skill[0] : skill;
              return (
                <Badge key={`${skillName}-${idx}`} variant="outline" className="text-xs bg-white">
                  {skillName}
                </Badge>
              );
            })}
            {gaps.length > 8 && (
              <Badge variant="outline" className="text-xs">+{gaps.length - 8} more</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SimulationResultCard({ result, milestones = [], compact = false }: Readonly<SimulationResultCardProps>) {
  if (!result) {
    return null;
  }

  if (!result.success) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Simulation failed</span>
        </div>
        {result.error && (
          <p className="text-xs text-red-600 mt-1">{result.error}</p>
        )}
      </Card>
    );
  }

  if (compact) {
    return <CompactSimulationResultCard result={result} />;
  }

  const market = result.market_context;
  const gaps = result.skill_gaps?.gaps || [];
  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Match Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScenarioCard
          title="Current"
          icon={Target}
          colorClass="text-blue-600"
          scenario={result.current}
          result={result}
        />
        <ScenarioCard
          title="Next Step"
          icon={Sparkles}
          colorClass="text-indigo-600"
          scenario={result.next}
          result={result}
        />
        <ScenarioCard
          title="Dream Target"
          icon={TrendingUp}
          colorClass="text-orange-600"
          scenario={result.dream}
          result={result}
        />
      </div>

      {/* Delta, Timeline & Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Match improvement</div>
          <div className={`text-lg font-bold ${(result.match_delta ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(result.match_delta ?? 0) >= 0 ? '+' : ''}{result.match_delta?.toFixed(1) ?? 0}%
          </div>
        </Card>
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <Clock className="w-3 h-3" />
            Estimated timeline
          </div>
          <div className="text-lg font-bold text-gray-900">
            {result.timeline_years != null
              ? `${result.timeline_years.toFixed(1)} years`
              : 'N/A'}
          </div>
        </Card>
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <GraduationCap className="w-3 h-3" />
            Experience needed
          </div>
          <div className="text-lg font-bold text-gray-900">
            {result.profile_years != null && result.target_years != null
              ? `${result.profile_years.toFixed(1)} → ${result.target_years.toFixed(1)} yrs`
              : 'N/A'}
          </div>
        </Card>
      </div>

      {/* Milestone Progress */}
      {totalCount > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mb-2">
            <span className="font-medium text-gray-700">Milestone Progress</span>
            <span className="text-gray-500">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Skill Gaps */}
      {gaps.length > 0 && (
        <Card className="p-4 bg-white border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key Skills to Develop
          </h4>
          <div className="text-xs text-gray-600 mb-3">
            {result.skill_gaps?.candidate_skill_count ?? 0} of {result.skill_gaps?.required_skill_count ?? 0} required skills covered
            {result.skill_gaps?.coverage != null && (
              <span className="ml-1 font-medium text-amber-700">
                ({(result.skill_gaps.coverage * 100).toFixed(0)}%)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {gaps.map((skill, idx) => {
              const skillName = Array.isArray(skill) ? skill[0] : skill;
              return (
                <Badge key={`${skillName}-${idx}`} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {skillName}
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      {/* Market Context */}
      {market && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Market Context
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900">{market.candidate_count}</div>
              <div className="text-xs text-slate-600">Candidates</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{(market.score_mean * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-600">Avg Match</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{(market.score_median * 100).toFixed(0)}%</div>
              <div className="text-xs text-slate-600">Median Match</div>
            </div>
          </div>
          {market.top_skills?.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-2">Top skills in this bucket</div>
              <div className="flex flex-wrap gap-1">
                {market.top_skills.slice(0, 6).map((item) => (
                  <Badge key={item.skill} variant="secondary" className="text-xs">
                    {item.skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
