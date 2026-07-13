import apiClient from './client';

export interface PersonalityQuestion {
  item_id: number;
  trait: string;
  facet: string;
  item_text: string;
}

export interface TraitScore {
  trait: string;
  trait_mean: number;
  trait_std: number;
  trait_pct: number;
  rank: number;
}

export interface FacetScore {
  trait: string;
  facet: string;
  facet_mean: number;
  facet_std: number;
  facet_pct: number;
}

export interface PersonalityTestResult {
  id: number;
  candidate_profile: number;
  responses: Record<string, number>;
  trait_scores: TraitScore[];
  facet_scores: FacetScore[];
  completed_at: string;
  updated_at: string;
}

export interface QuestionsResponse {
  success: boolean;
  count: number;
  questions: PersonalityQuestion[];
}

export interface MyResultResponse {
  success: boolean;
  completed: boolean;
  result: PersonalityTestResult | null;
}

export interface SubmitResponse {
  success: boolean;
  created: boolean;
  result: PersonalityTestResult;
}

const ENDPOINTS = {
  questions: '/candidates/personality-test/questions/',
  myResult: '/candidates/personality-test/my-result/',
  submit: '/candidates/personality-test/submit/',
  candidateResult: (candidateProfileId: number) =>
    `/candidates/personality-test/result/${candidateProfileId}/`,
};

export async function getPersonalityTestQuestions(): Promise<QuestionsResponse> {
  const response = await apiClient.request(ENDPOINTS.questions);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to load personality test questions');
  }
  return response.json();
}

export async function getMyPersonalityTestResult(): Promise<MyResultResponse> {
  const response = await apiClient.request(ENDPOINTS.myResult);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to load personality test result');
  }
  return response.json();
}

export async function getCandidatePersonalityTestResult(
  candidateProfileId: number
): Promise<MyResultResponse> {
  const response = await apiClient.request(ENDPOINTS.candidateResult(candidateProfileId));
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to load candidate personality test result');
  }
  return response.json();
}

export async function submitPersonalityTest(
  responses: Record<string, number>
): Promise<SubmitResponse> {
  const response = await apiClient.request(ENDPOINTS.submit, {
    method: 'POST',
    body: JSON.stringify({ responses }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit personality test');
  }

  return response.json();
}
