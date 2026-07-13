import apiClient from './client';

export interface CreateVerificationRequestPayload {
  candidate_id: number;
  work_history_index: number;
  check_category: 'background' | 'reference';
  min_reference?: number;
  role?: string;
  notes?: string;
}

export interface VerificationRequest {
  id: number;
  candidate: number;
  candidate_name: string;
  recruiter: number;
  recruiter_name: string;
  check_category: 'background' | 'reference';
  work_history_index: number;
  work_history_snapshot: unknown;
  status: string;
  notes: string;
  background_check: unknown;
  reference_check: unknown;
  created_at: string;
  updated_at: string;
}

class VerificationService {
  async createRequest(payload: CreateVerificationRequestPayload): Promise<VerificationRequest> {
    const response = await apiClient.request('/verifications/requests/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Failed to create verification request');
    }

    return response.json();
  }
}

export const verificationService = new VerificationService();
