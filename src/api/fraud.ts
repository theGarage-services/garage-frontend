import apiClient from './client';

export async function flagJobPostAsFraud(
  jobId: string | number,
  reason?: string
): Promise<{ success: boolean; created: boolean; message: string; flag_id?: number }> {
  const response = await apiClient.request(`/jobposts/${jobId}/flag-fraud/`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || '' }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to flag job post');
  }
  return data;
}

export async function flagCandidateProfileAsFraud(
  candidateId: string | number,
  reason?: string
): Promise<{ success: boolean; created: boolean; message: string; flag_id?: number }> {
  const response = await apiClient.request(`/jobposts/candidates/${candidateId}/flag-fraud/`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || '' }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to flag candidate profile');
  }
  return data;
}
