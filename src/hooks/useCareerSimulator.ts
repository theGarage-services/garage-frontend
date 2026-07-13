import { useCallback, useState } from 'react';
import {
  careerSimulatorApi,
  SimulationInput,
  SimulationResult,
  Milestone,
  MilestoneInput,
  CareerChapterSummary,
  CareerChapterSummaryInput,
} from '../api/careerSimulator';

interface UseCareerSimulatorReturn {
  result: SimulationResult | null;
  milestones: Milestone[];
  chapterSummary: CareerChapterSummary | null;
  loading: boolean;
  error: string | null;
  simulate: (input?: SimulationInput, apply?: boolean) => Promise<SimulationResult | null>;
  fetchMilestones: (chapter?: string) => Promise<Milestone[]>;
  createMilestone: (milestone: MilestoneInput) => Promise<void>;
  updateMilestone: (
    milestoneId: number,
    updates: Partial<MilestoneInput> & { completed?: boolean }
  ) => Promise<void>;
  deleteMilestone: (milestoneId: number) => Promise<void>;
  fetchChapterSummary: () => Promise<CareerChapterSummary | null>;
  updateChapterSummary: (updates: CareerChapterSummaryInput) => Promise<void>;
  refresh: (input?: SimulationInput) => Promise<void>;
}

export function useCareerSimulator(): UseCareerSimulatorReturn {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [chapterSummary, setChapterSummary] = useState<CareerChapterSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(
    async (input: SimulationInput = {}, apply = false): Promise<SimulationResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const data = apply
          ? await careerSimulatorApi.applySimulation(input)
          : await careerSimulatorApi.simulate(input);
        setResult(data);
        if (apply) {
          await fetchMilestones();
        }
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Simulation failed';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMilestones = useCallback(async (chapter?: string): Promise<Milestone[]> => {
    try {
      const data = await careerSimulatorApi.getMilestones(chapter);
      setMilestones(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load milestones';
      setError(message);
      return [];
    }
  }, []);

  const createMilestone = useCallback(
    async (milestone: MilestoneInput): Promise<void> => {
      setError(null);
      try {
        await careerSimulatorApi.createMilestone(milestone);
        await fetchMilestones();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create milestone';
        setError(message);
      }
    },
    [fetchMilestones]
  );

  const updateMilestone = useCallback(
    async (
      milestoneId: number,
      updates: Partial<MilestoneInput> & { completed?: boolean }
    ): Promise<void> => {
      setError(null);
      try {
        await careerSimulatorApi.updateMilestone(milestoneId, updates);
        await fetchMilestones();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update milestone';
        setError(message);
      }
    },
    [fetchMilestones]
  );

  const deleteMilestone = useCallback(
    async (milestoneId: number): Promise<void> => {
      setError(null);
      try {
        await careerSimulatorApi.deleteMilestone(milestoneId);
        await fetchMilestones();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete milestone';
        setError(message);
      }
    },
    [fetchMilestones]
  );

  const fetchChapterSummary = useCallback(async (): Promise<CareerChapterSummary | null> => {
    setError(null);
    try {
      const data = await careerSimulatorApi.getChapterSummary();
      setChapterSummary(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load chapter summary';
      setError(message);
      return null;
    }
  }, []);

  const updateChapterSummary = useCallback(
    async (updates: CareerChapterSummaryInput): Promise<void> => {
      setError(null);
      try {
        const data = await careerSimulatorApi.updateChapterSummary(updates);
        setChapterSummary(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update chapter summary';
        setError(message);
      }
    },
    []
  );

  const refresh = useCallback(
    async (input: SimulationInput = {}): Promise<void> => {
      await simulate(input, true);
    },
    [simulate]
  );

  return {
    result,
    milestones,
    chapterSummary,
    loading,
    error,
    simulate,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    fetchChapterSummary,
    updateChapterSummary,
    refresh,
  };
}
