import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, X } from 'lucide-react';
import {
  getPersonalityTestQuestions,
  submitPersonalityTest,
  type PersonalityQuestion,
} from '@/api/personalityTest';

interface PersonalityTestProps {
  onComplete: () => void;
  onCancel: () => void;
}

const QUESTIONS_PER_PAGE = 10;

function shuffleArray<T>(array: T[]): T[] {
  // Using Math.random() is safe here for shuffling quiz questions (non-security context)
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SCALE_LABELS: Record<number, string> = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

export function PersonalityTest({ onComplete, onCancel }: Readonly<PersonalityTestProps>) {
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getPersonalityTestQuestions();
        setQuestions(shuffleArray(data.questions));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    void loadQuestions();
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE)),
    [questions]
  );

  const currentQuestions = useMemo(() => {
    const start = page * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, page]);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return (Object.keys(answers).length / questions.length) * 100;
  }, [answers, questions]);

  const currentPageAnswered = useMemo(() => {
    return currentQuestions.every((q) => answers[q.item_id] !== undefined);
  }, [currentQuestions, answers]);

  const handleSelect = (itemId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentPageAnswered) {
      setError('Please answer all questions on this page before submitting.');
      return;
    }

    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const responses = Object.fromEntries(
        Object.entries(answers).map(([key, value]) => [key, value])
      );
      await submitPersonalityTest(responses);
      onComplete();
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 bg-white/80 border-orange-100 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35] mx-auto mb-4" />
        <p className="text-gray-600">Loading your personality test...</p>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 bg-white/80 border-orange-100 text-center">
        <p className="text-gray-600">
          {error || 'No questions are available right now. Please try again later.'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/80 border-orange-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Big Five Personality Test</h3>
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages} ({Object.keys(answers).length} of {questions.length} answered)
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close test"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <Progress value={progress} className="h-2 mb-6 bg-orange-100" />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6 mb-6">
        {currentQuestions.map((question, index) => {
          const questionNumber = page * QUESTIONS_PER_PAGE + index + 1;
          const selected = answers[question.item_id];

          return (
            <div
              key={question.item_id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-gray-900 mb-4">
                <span className="font-medium text-[#ff6b35] mr-2">{questionNumber}.</span>
                {question.item_text}
              </p>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = selected === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(question.item_id, value)}
                      className={`flex-1 min-w-[120px] px-3 py-2 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff6b35] hover:text-[#ff6b35]'
                      }`}
                    >
                      <span className="font-semibold">{value}</span>
                      <span className="block text-xs mt-0.5">{SCALE_LABELS[value]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={page === 0 || submitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {page === totalPages - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#ff6b35] hover:bg-[#e55a2b]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Test
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!currentPageAnswered}
            className="bg-[#ff6b35] hover:bg-[#e55a2b]"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}
