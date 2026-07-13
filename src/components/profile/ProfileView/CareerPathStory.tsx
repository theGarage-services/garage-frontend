import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Progress } from '../../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Sparkles, BookOpen, Edit3, Save, Plus, X, ChevronRight, Target, TrendingUp, Calendar,
  Lightbulb, Zap, CheckCircle, Clock, MapPin, Star, Brain, Rocket, Flag, Trophy, Crown,
  RotateCcw, AlertCircle
} from 'lucide-react';
import { useCareerSimulator } from '../../../hooks/useCareerSimulator';
import { INDUSTRY_CHOICES, EXP_LEVEL_LABELS } from '../../queue/BucketManager';
import type { CareerChapterSummary } from '../../../api/careerSimulator';

type ChapterType = 'current' | 'next' | 'dream';

interface CareerPathStoryProps {
  user?: any;
  onNavigate: (view: string) => void;
  profileIndustry?: string;
  profileExpLevel?: string;
}

interface Milestone {
  id: string | number;
  title: string;
  description?: string;
  targetDate?: string;
  completed: boolean;
  chapter: ChapterType;
  requiredSkills: string[];
  recommendations: string[];
}

interface CareerChapter {
  id: string;
  name: string;
  type: ChapterType;
  story: string;
  color: string;
  icon: any;
}

const LEVEL_OPTIONS = Object.entries(EXP_LEVEL_LABELS).map(([value, label]) => ({ value, label }));

export function CareerPathStory({ user, onNavigate, profileIndustry, profileExpLevel }: Readonly<CareerPathStoryProps>) {
  const isPremium = user?.isPremium || false;

  const {
    result: simulationResult,
    milestones: apiMilestones,
    loading,
    error,
    simulate,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    refresh,
    deleteMilestone,
    fetchChapterSummary,
    updateChapterSummary,
  } = useCareerSimulator();

  // Manual override state - initialize from profile if available
  const [selectedIndustry, setSelectedIndustry] = useState<string>(profileIndustry || '');
  const [selectedLevel, setSelectedLevel] = useState<string>(profileExpLevel || '');
  const [hypotheticalSkills, setHypotheticalSkills] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Track which target the narrative was generated for (to fix stale-narrative bug)
  const [narrativeTarget, setNarrativeTarget] = useState<{ industry: string; level: string } | null>(null);

  // Loading state for initial simulation
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Career Story State — editable summaries per chapter
  const [careerStory, setCareerStory] = useState({
    currentChapter: '',
    nextChapter: '',
    dreamChapter: ''
  });

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [tempStory, setTempStory] = useState('');

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    id: '',
    title: '',
    description: '',
    targetDate: '',
    completed: false,
    chapter: 'next',
    requiredSkills: [],
    recommendations: []
  });

  // On mount (premium only): load persisted data and run auto-suggest simulation
  useEffect(() => {
    if (!isPremium) return;

    let cancelled = false;
    (async () => {
      await fetchMilestones();
      const summary = await fetchChapterSummary();
      if (!cancelled && summary) {
        setCareerStory({
          currentChapter: summary.current_chapter || '',
          nextChapter: summary.next_chapter || '',
          dreamChapter: summary.dream_chapter || '',
        });
      }
      // Use profile industry/exp_level as fallback if not already selected
      const result = await simulate({
        target_industry: selectedIndustry || profileIndustry || undefined,
        target_level: selectedLevel || profileExpLevel || undefined,
      });
      if (!cancelled && result?.success) {
        setSelectedIndustry(result.target_industry || '');
        setSelectedLevel(result.target_level || '');
        setNarrativeTarget({
          industry: result.target_industry || '',
          level: result.target_level || '',
        });
      }
      setIsInitialLoading(false);
    })();

    return () => { cancelled = true; };
  }, [isPremium, profileIndustry, profileExpLevel]);

  // Sync API milestones into local state (id keeps API number; UI keys tolerate it)
  useEffect(() => {
    setMilestones(
      apiMilestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description || '',
        targetDate: m.target_date || '',
        completed: m.completed,
        chapter: m.chapter as ChapterType,
        requiredSkills: m.required_skills || [],
        recommendations: m.recommendations || [],
      }))
    );
  }, [apiMilestones]);

  // Derive chapter stories from simulation result, but never overwrite user edits.
  // For dream chapter, auto-refresh only when target changes AND user hasn't manually edited for that target.
  useEffect(() => {
    if (!simulationResult?.success) return;

    const current = simulationResult.current;
    const next = simulationResult.next;
    const dream = simulationResult.dream;

    const currentLabel = current?.level ? EXP_LEVEL_LABELS[current.level] : current?.level;
    const nextLabel = next?.level ? EXP_LEVEL_LABELS[next.level] : next?.level;
    const dreamLabel = dream?.level ? EXP_LEVEL_LABELS[dream.level] : dream?.level;

    const targetIndustry = simulationResult.target_industry || '';
    const targetLevel = simulationResult.target_level || '';
    const targetChanged = narrativeTarget?.industry !== targetIndustry || narrativeTarget.level !== targetLevel;

    setCareerStory(prev => ({
      currentChapter: prev.currentChapter || (current?.industry
        ? `I'm currently positioned in ${current.industry.replaceAll('-', ' ')} at the ${currentLabel || current.level} level with a ${current.match_percentage?.toFixed(2) ?? 0}% profile match.`
        : 'Write your current career chapter...'),
      nextChapter: prev.nextChapter || (next?.level
        ? `My next milestone is to reach the ${nextLabel || next.level} level in ${(next.industry || current?.industry || 'my field').replaceAll('-', ' ')}.`
        : 'Write your next career chapter...'),
      dreamChapter: targetChanged && !prev.dreamChapter ? (dream?.industry
        ? `My dream is to become a strong fit for ${dream.industry.replaceAll('-', ' ')} roles at the ${dreamLabel || dream.level} level, currently matching ${dream.match_percentage?.toFixed(2) ?? 0}%.`
        : 'Write your dream career chapter...') : prev.dreamChapter,
    }));

    if (targetChanged) {
      setNarrativeTarget({ industry: targetIndustry, level: targetLevel });
    }
  }, [simulationResult, narrativeTarget]);

  const getHypotheticalSkills = useCallback((): string[] => {
    return hypotheticalSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [hypotheticalSkills]);

  const runManualSimulation = useCallback(async () => {
    if (!selectedIndustry || !selectedLevel) return;
    await simulate({
      target_industry: selectedIndustry,
      target_level: selectedLevel,
      hypothetical_skills: getHypotheticalSkills(),
    });
  }, [selectedIndustry, selectedLevel, getHypotheticalSkills, simulate]);

  const confirmApplySimulation = useCallback(async () => {
    await refresh({
      target_industry: selectedIndustry || undefined,
      target_level: selectedLevel || undefined,
      hypothetical_skills: getHypotheticalSkills(),
    });
    setShowPreview(false);
  }, [selectedIndustry, selectedLevel, getHypotheticalSkills, refresh]);

  const previewMilestones = useCallback((): Milestone[] => {
    if (!simulationResult?.success) return [];

    const today = new Date();
    const gaps = simulationResult.skill_gaps?.gaps || [];
    const timelineYears = simulationResult.timeline_years ?? 1;
    const totalGaps = Math.max(gaps.length, 1);
    const monthsPerGap = Math.max(1, Math.round((timelineYears * 12) / totalGaps));
    const targetIndustry = simulationResult.target_industry || simulationResult.dream?.industry || '';
    const targetLevel = simulationResult.target_level || simulationResult.dream?.level || '';
    const nextLevel = simulationResult.next?.level;

    const dreamMilestones: Milestone[] = gaps.map((skill, idx) => {
      const skillName = Array.isArray(skill) ? skill[0] : skill;
      const targetDate = new Date(today);
      targetDate.setMonth(targetDate.getMonth() + monthsPerGap * (idx + 1));
      return {
        id: `preview-dream-${idx}`,
        title: `Develop ${skillName}`,
        description: `Build proficiency in ${skillName} to meet the expectations of ${targetLevel} roles in ${targetIndustry.replaceAll('-', ' ')}.`,
        targetDate: targetDate.toISOString().split('T')[0],
        completed: false,
        chapter: 'dream',
        requiredSkills: [skillName],
        recommendations: [
          `Take a project or course focused on ${skillName}`,
          `Practice ${skillName} in a work or side-project context`,
        ],
      };
    });

    const nextMilestone: Milestone | null = nextLevel
      ? {
          id: 'preview-next',
          title: `Advance to ${nextLevel}`,
          description: `Progress to ${nextLevel} in your current industry to build seniority before making a larger move.`,
          targetDate: new Date(new Date().setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0],
          completed: false,
          chapter: 'next',
          requiredSkills: [],
          recommendations: [],
        }
      : null;

    return nextMilestone ? [...dreamMilestones, nextMilestone] : dreamMilestones;
  }, [simulationResult]);

  const chapters: CareerChapter[] = [
    {
      id: 'current',
      name: 'Current Chapter',
      type: 'current',
      story: careerStory.currentChapter,
      color: 'from-blue-500 to-blue-600',
      icon: MapPin
    },
    {
      id: 'next',
      name: 'Next Chapter',
      type: 'next',
      story: careerStory.nextChapter,
      color: 'from-[#ff6b35] to-[#ff8c42]',
      icon: Rocket
    },
    {
      id: 'dream',
      name: 'Dream Chapter',
      type: 'dream',
      story: careerStory.dreamChapter,
      color: 'from-purple-500 to-purple-600',
      icon: Trophy
    }
  ];

  const handleEditChapter = (chapterType: string, currentStory: string) => {
    setIsEditing(chapterType);
    setTempStory(currentStory);
  };

  const handleSaveChapter = async (chapterType: string) => {
    const fieldMap: Record<string, keyof CareerChapterSummary> = {
      current: 'current_chapter',
      next: 'next_chapter',
      dream: 'dream_chapter',
    };

    setCareerStory({
      ...careerStory,
      [`${chapterType}Chapter`]: tempStory
    });

    await updateChapterSummary({
      [fieldMap[chapterType]]: tempStory,
    });

    setIsEditing(null);
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.targetDate) return;
    await createMilestone({
      title: newMilestone.title,
      description: newMilestone.description,
      target_date: newMilestone.targetDate,
      chapter: newMilestone.chapter,
      required_skills: newMilestone.requiredSkills,
      recommendations: newMilestone.recommendations,
    });
    setNewMilestone({
      id: '',
      title: '',
      description: '',
      targetDate: '',
      completed: false,
      chapter: 'next',
      requiredSkills: [],
      recommendations: []
    });
    setIsAddingMilestone(false);
  };

  const handleToggleMilestone = async (id: string | number, completed: boolean) => {
    await updateMilestone(Number(id), { completed: !completed });
  };

  const handleDeleteMilestone = async (id: string | number) => {
    await deleteMilestone(Number(id));
  };

  const getMilestonesByChapter = (chapter: 'current' | 'next' | 'dream') => {
    return milestones.filter(m => m.chapter === chapter);
  };

  const getProgress = () => {
    // Baseline-relative progress calculation
    if (simulationResult?.success && simulationResult.baseline_match_percentage !== null) {
      const baseline = simulationResult.baseline_match_percentage;
      const current = simulationResult.current?.match_percentage ?? 0;
      const dream = simulationResult.dream?.match_percentage ?? 0;

      // Avoid division by zero
      const total_delta = dream - baseline;
      if (total_delta <= 0) {
        // If dream is not better than baseline, use current match percentage as progress
        return Math.min(100, Math.max(0, Math.round(current)));
      }

      // Calculate progress as percentage of journey completed
      const current_delta = current - baseline;
      const progress = (current_delta / total_delta) * 100;

      // Clamp between 0 and 100
      return Math.min(100, Math.max(0, Math.round(progress)));
    }

    // Fallback to milestone-based progress if no simulation data
    const completed = milestones.filter(m => m.completed).length;
    return milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
  };

  const getAllRequiredSkills = () => {
    const skills = new Set<string>();
    milestones.forEach(m => {
      m.requiredSkills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills);
  };

  const hasSkillMilestone = (skillName: string): boolean => {
    return apiMilestones.some(m => 
      m.chapter === 'dream' && 
      m.required_skills.some((skill: string) => 
        skill.toLowerCase() === skillName.toLowerCase()
      )
    );
  };

  const getSkillsRoadmap = () => {
    // Source skills from simulation result instead of milestones
    if (simulationResult?.success && simulationResult.skill_gaps?.success) {
      const gaps = simulationResult.skill_gaps.gaps;
      const timelineYears = simulationResult.timeline_years;
      
      // Calculate timeline per skill
      let monthsPerSkill = '';
      if (timelineYears && gaps.length > 0) {
        const monthsPerGap = Math.max(1, Math.round((timelineYears * 12) / gaps.length));
        monthsPerSkill = `~${monthsPerGap}mo`;
      }

      // Convert gaps to skill objects
      const skills = gaps.map((gap) => {
        const [name, similarity] = Array.isArray(gap) ? gap : [gap, undefined];
        
        return {
          name,
          similarity,
          timeline: monthsPerSkill,
          hasMilestone: hasSkillMilestone(name),
        };
      });

      return skills;
    }

    // Fallback to milestone-based skills if no simulation data
    return getAllRequiredSkills().map(name => ({
      name,
      similarity: undefined,
      timeline: undefined,
      hasMilestone: hasSkillMilestone(name),
    }));
  };

  const handleSkillClick = (skillName: string) => {
    // Find and scroll to the corresponding milestone in the Dream chapter
    const milestone = apiMilestones.some(m => 
      m.chapter === 'dream' && 
      m.required_skills.some((skill: string) => 
        skill.toLowerCase() === skillName.toLowerCase()
      )
    );
    
    if (milestone) {
      // Scroll to the Dream chapter
      const dreamChapterElement = document.querySelector('[data-chapter="dream"]');
      if (dreamChapterElement) {
        dreamChapterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isResultForSelectedTarget =
    simulationResult?.target_industry === selectedIndustry &&
    simulationResult?.target_level === selectedLevel;

  // Helper to render score breakdown inline
  const renderScoreBreakdown = (breakdown?: any) => {
    if (!breakdown) return null;
    const labels: Record<string, string> = {
      semantic: 'Semantic Match',
      skill_coverage: 'Skill Coverage',
      experience: 'Experience',
      confidence: 'Confidence',
      education: 'Education',
      industry_alignment: 'Industry Alignment',
      level_alignment: 'Level Alignment',
    };
    return (
      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => {
          const value = (breakdown[key] ?? 0) * 100;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-600">{labels[key]}</span>
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
  };

  // Premium restriction check
  if (!isPremium) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 max-w-[95vw] sm:max-w-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200">
          <div className="text-center space-y-6">
            {/* Premium Badge */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">Career Path Story</h2>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Feature
              </Badge>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              Create your personalized career journey with AI-powered insights, milestone tracking, and strategic recommendations to achieve your dream role.
            </p>

            {/* Benefits */}
            <div className="bg-white/80 rounded-lg p-6 border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-4">What you'll get:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Write your career story across multiple chapters</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Set and track career milestones with target dates</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Get AI-powered recommendations for each goal</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Visualize your career progression timeline</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Build a personalized skills roadmap</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Track progress toward your dream career</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => onNavigate('account-settings')}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl text-gray-900">My Career Journey</h2>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <p className="text-gray-600">Write your career story and get AI-powered guidance to achieve your goals</p>
        </div>
      </div>

      {/* Loading State */}
      {isInitialLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 bg-white/80 border-2 border-gray-200">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isInitialLoading && !simulationResult?.success && error && (
        <Card className="p-6 bg-red-50 border-2 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Simulation failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                {!profileIndustry || !profileExpLevel
                  ? "Your profile is missing industry or experience level. Please complete your profile to enable career simulation."
                  : "The career simulation service encountered an error. Please try again."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isInitialLoading && !simulationResult?.success && !error && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-center">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Career Journey</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add your industry and experience level in your profile to unlock AI-powered career simulation.
          </p>
          <Button onClick={() => onNavigate('account-settings')} className="bg-indigo-600 hover:bg-indigo-700">
            Complete Your Profile
          </Button>
        </Card>
      )}

      {/* Main Content */}
      {!isInitialLoading && simulationResult?.success && (
        <>
      {/* AI Simulation Controls */}
      <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="career-target-industry" className="text-sm font-medium text-gray-700 mb-1 block">Target Industry</label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger id="career-target-industry">
                <SelectValue placeholder="Auto-suggest" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_CHOICES.map(ind => (
                  <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="career-target-level" className="text-sm font-medium text-gray-700 mb-1 block">Target Level</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger id="career-target-level">
                <SelectValue placeholder="Auto-suggest" />
              </SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map(lvl => (
                  <SelectItem key={lvl.value} value={lvl.value}>{lvl.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="career-hypothetical-skills" className="text-sm font-medium text-gray-700 mb-1 block">
              Hypothetical Skills (optional)
            </label>
            <Input
              id="career-hypothetical-skills"
              placeholder="e.g. AWS, React, Python"
              value={hypotheticalSkills}
              onChange={(e) => setHypotheticalSkills(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated skills to simulate &ldquo;what if&rdquo; you had them.</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={runManualSimulation}
              disabled={!selectedIndustry || !selectedLevel || loading}
              className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isResultForSelectedTarget ? 'Re-simulate' : 'Simulate'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!simulationResult?.success || loading}
              className="border-indigo-200 hover:bg-indigo-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Apply AI Milestones
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </Card>

      {/* Suggested Targets */}
      {simulationResult?.success && simulationResult.suggested_targets && simulationResult.suggested_targets.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI-Suggested Career Targets
          </h3>
          <div className="flex flex-wrap gap-2">
            {simulationResult.suggested_targets.map((target, idx) => {
              const label = target.industry.replaceAll('-', ' ');
              const levelLabel = target.level
                ? EXP_LEVEL_LABELS[target.level] || target.level
                : 'Auto';
              const isActive = selectedIndustry === target.industry && selectedLevel === (target.level || '');
              return (
                <button
                  key={`${target.industry}-${target.level || 'none'}-${idx}`}
                  onClick={() => {
                    setSelectedIndustry(target.industry);
                    setSelectedLevel(target.level || '');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#ff6b35] text-white'
                      : 'bg-white text-gray-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {label} • {levelLabel}
                  <span className="ml-1.5 opacity-80">
                    {((target.industry_probability ?? 0) * 100).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Overall Progress */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Journey Progress</h3>
              <p className="text-sm text-gray-600">{milestones.filter(m => m.completed).length} of {milestones.length} milestones completed</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1">{getProgress()}%</div>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>
        <Progress value={getProgress()} className="h-3" />
      </Card>

      {/* Career Chapters */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-lg text-gray-900">Your Career Story</h3>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500 via-[#ff6b35] to-purple-500 hidden md:block" />

          <div className="space-y-8">
            {chapters.map((chapter, index) => {
              const IconComponent = chapter.icon;
              const chapterMilestones = getMilestonesByChapter(chapter.type);

              return (
                <Card key={chapter.id} className="p-6 bg-white/80 border-2 hover:shadow-lg transition-all relative" data-chapter={chapter.type}>
                  {/* Chapter Number Badge */}
                  <div className="absolute -left-3 top-6 w-12 h-12 bg-white rounded-full border-4 border-white hidden md:flex items-center justify-center shadow-lg">
                    <div className={`w-10 h-10 bg-gradient-to-r ${chapter.color} rounded-full flex items-center justify-center text-white`}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="md:ml-12">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${chapter.color} rounded-xl flex items-center justify-center shadow-md`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg text-gray-900">
                            {chapter.name}
                            {chapter.type === 'dream' && simulationResult?.target_industry && (
                              <span className="text-sm text-gray-600 ml-2">
                                — {simulationResult.target_industry.replaceAll('-', ' ')} • {EXP_LEVEL_LABELS[simulationResult.target_level] || simulationResult.target_level}
                              </span>
                            )}
                          </h4>
                          {chapter.type === 'next' && simulationResult?.next && (
                            <p className="text-xs text-gray-500 mt-1">
                              Automatically your next level in {simulationResult.next.industry?.replaceAll('-', ' ') || 'your current industry'}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs mt-1">
                            {chapterMilestones.length} milestone{chapterMilestones.length === 1 ? '' : 's'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => isEditing === chapter.type 
                          ? handleSaveChapter(chapter.type)
                          : handleEditChapter(chapter.type, chapter.story)
                        }
                      >
                        {isEditing === chapter.type ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>

                    {isEditing === chapter.type ? (
                      <Textarea
                        value={tempStory}
                        onChange={(e) => setTempStory(e.target.value)}
                        className="min-h-[120px] mb-4"
                        placeholder={`Write about your ${chapter.name.toLowerCase()}...`}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {chapter.story}
                      </p>
                    )}

                    {/* Simulation Data for this chapter */}
                    {simulationResult?.success && (() => {
                      const scenarioData = simulationResult[chapter.type as keyof typeof simulationResult] as any;
                      if (!scenarioData || typeof scenarioData !== 'object' || !('match_percentage' in scenarioData)) return null;

                      const matchPct = scenarioData.match_percentage ?? 0;
                      const breakdown = scenarioData.score_breakdown;

                      return (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Profile Match</span>
                            <span className="text-lg font-bold text-gray-900">{matchPct.toFixed(2)}%</span>
                          </div>
                          <Progress value={matchPct} className="h-2 mb-3" />
                          {renderScoreBreakdown(breakdown)}

                          {/* Skill gaps for dream chapter */}
                          {chapter.type === 'dream' && simulationResult.skill_gaps?.gaps && simulationResult.skill_gaps.gaps.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs font-medium text-gray-700 mb-2">Skill Gaps</p>
                              <div className="flex flex-wrap gap-1">
                                {simulationResult.skill_gaps.gaps.map((gap, idx) => {
                                  const skillName = Array.isArray(gap) ? gap[0] : gap;
                                  return (
                                    <Badge key={`${skillName}-${idx}`} variant="outline" className="text-xs bg-white">
                                      {skillName}
                                    </Badge>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                {simulationResult.skill_gaps.candidate_skill_count} of {simulationResult.skill_gaps.required_skill_count} skills covered ({((simulationResult.skill_gaps.candidate_skill_count / simulationResult.skill_gaps.required_skill_count) * 100).toFixed(0)}%)
                              </p>
                            </div>
                          )}

                          {/* Experience comparison */}
                          {chapter.type === 'dream' && simulationResult.profile_years !== undefined && simulationResult.target_years !== undefined && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs text-gray-600">
                                Experience: {simulationResult.profile_years} years → {simulationResult.target_years} years needed
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Milestones for this chapter */}
                    <div className="space-y-3 mt-4">
                      {chapterMilestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            milestone.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleMilestone(milestone.id, milestone.completed)}
                              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                milestone.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-[#ff6b35]'
                              }`}
                            >
                              {milestone.completed && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className={`font-medium ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {milestone.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {milestone.targetDate
                                      ? new Date(milestone.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                      : 'No date'}
                                  </Badge>
                                  <button
                                    onClick={() => handleDeleteMilestone(milestone.id)}
                                    className="p-1 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                  </button>
                                </div>
                              </div>

                              {!milestone.completed && milestone.requiredSkills.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {milestone.requiredSkills.map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!milestone.completed && milestone.recommendations.length > 0 && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs text-blue-900">AI Recommendations:</p>
                                  </div>
                                  <ul className="space-y-1">
                                    {milestone.recommendations.map((rec) => (
                                      <li key={rec} className="text-xs text-blue-700 flex items-start gap-2">
                                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Inline add milestone link */}
                      <button
                        onClick={() => {
                          setNewMilestone({
                            id: '',
                            title: '',
                            description: '',
                            targetDate: '',
                            completed: false,
                            chapter: chapter.type,
                            requiredSkills: [],
                            recommendations: []
                          });
                          setIsAddingMilestone(true);
                        }}
                        className="text-sm text-gray-500 hover:text-[#ff6b35] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add custom milestone
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {isAddingMilestone && (
        <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Milestone</DialogTitle>
              <DialogDescription>
                Add a personal milestone to your {newMilestone.chapter === 'next' ? 'Next' : 'Dream'} chapter.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="milestone-title" className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                <Input
                  id="milestone-title"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Milestone title"
                />
              </div>
              <div>
                <label htmlFor="milestone-description" className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea
                  id="milestone-description"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  placeholder="Description"
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label htmlFor="milestone-date" className="text-sm font-medium text-gray-700 mb-1 block">Target Date</label>
                <Input
                  id="milestone-date"
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="milestone-skills" className="text-sm font-medium text-gray-700 mb-1 block">Required Skills (comma-separated)</label>
                <Input
                  id="milestone-skills"
                  placeholder="e.g. AWS, React, Python"
                  onChange={(e) => setNewMilestone({
                    ...newMilestone,
                    requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingMilestone(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddMilestone}
                disabled={!newMilestone.title}
                className="bg-[#ff6b35] hover:bg-[#e55a2b]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Skills Roadmap */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg text-gray-900">Skills Roadmap</h3>
            <p className="text-sm text-gray-600">Skills you'll need to achieve your career goals</p>
          </div>
        </div>

        {/* Coverage Header */}
        {simulationResult?.success && simulationResult.skill_gaps?.success && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-900">
                {(simulationResult.skill_gaps.coverage * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={simulationResult.skill_gaps.coverage * 100} className="h-2" />
          </div>
        )}

        {/* Skills List */}
        <div className="flex flex-wrap gap-2">
          {getSkillsRoadmap().map((skill) => (
            <Badge
              key={skill.name}
              className="bg-white border-orange-200 text-gray-700 hover:bg-orange-100 transition-colors cursor-pointer"
              onClick={() => handleSkillClick(skill.name)}
            >
              <Star className="w-3 h-3 mr-1" />
              {skill.name}
              {skill.similarity !== undefined && skill.similarity > 0.3 && (
                <span className="ml-1 text-xs text-orange-600">
                  ({(skill.similarity * 100).toFixed(0)}%)
                </span>
              )}
              {skill.timeline && (
                <span className="ml-2 text-xs text-gray-500">
                  ~{skill.timeline}
                </span>
              )}
              {skill.hasMilestone && (
                <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
              )}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Success Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white/80 border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-2xl">
              {simulationResult?.timeline_years ? `${simulationResult.timeline_years}y` : '--'}
            </div>
          </div>
          <p className="text-sm text-gray-600">Timeline to Target</p>
        </Card>
        <Card className="p-4 bg-white/80 border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="text-2xl">
              {simulationResult?.success && simulationResult.skill_gaps?.success
                ? `${simulationResult.skill_gaps.candidate_skill_count}/${simulationResult.skill_gaps.required_skill_count}`
                : '--'}
            </div>
          </div>
          <p className="text-sm text-gray-600">Skills Covered</p>
        </Card>
        <Card className="p-4 bg-white/80 border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="w-5 h-5 text-[#ff6b35]" />
            <div className="text-2xl">
              {simulationResult?.success && simulationResult.skill_gaps?.success
                ? simulationResult.skill_gaps.gaps.length
                : '--'}
            </div>
          </div>
          <p className="text-sm text-gray-600">Skills to Develop</p>
        </Card>
      </div>

      {/* Milestone Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview AI Milestones</DialogTitle>
            <DialogDescription>
              These milestones will be created when you apply the simulation. Existing AI-generated milestones will be refreshed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {previewMilestones().length === 0 && (
              <p className="text-sm text-gray-600 text-center">No milestones to generate from the current simulation.</p>
            )}
            {previewMilestones().map((milestone) => (
              <Card key={milestone.id} className="p-4 border-l-4 border-l-[#ff6b35]">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.chapter === 'next' ? 'bg-indigo-100' : 'bg-orange-100'
                  }`}>
                    {milestone.chapter === 'next' ? (
                      <Rocket className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Star className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-medium text-gray-900 min-w-0">{milestone.title}</h4>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        {milestone.chapter === 'next' ? 'Next Chapter' : 'Dream Chapter'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    {milestone.targetDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(milestone.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    )}
                    {milestone.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {milestone.requiredSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmApplySimulation}
              disabled={loading}
              className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              Apply Milestones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
