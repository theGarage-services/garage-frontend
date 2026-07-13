import apiClient from './client';

export interface QueueApproval {
  id: string;
  type: 'job-posting' | 'offer' | 'budget';
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: {
    name: string;
    email: string;
    avatar: string | null;
  };
  submittedAt: string;
  data: Record<string, any>;
  urgency: 'low' | 'medium' | 'high';
}

export interface ApprovalActionPayload {
  comment?: string;
}

function transformApproval(raw: any): QueueApproval {
  return {
    id: raw.id,
    type: raw.type,
    status: raw.status,
    submittedBy: {
      name: raw.submitted_by?.name || '',
      email: raw.submitted_by?.email || '',
      avatar: raw.submitted_by?.avatar || null,
    },
    submittedAt: raw.submitted_at,
    data: raw.data || {},
    urgency: raw.urgency,
  };
}

class ApprovalService {
  /**
   * Get all pending approvals
   */
  async getPendingApprovals(type?: string): Promise<QueueApproval[]> {
    const params = new URLSearchParams();
    if (type && type !== 'all') {
      params.append('type', type);
    }

    const query = params.toString();
    const endpoint = query ? `/approvals/?${query}` : '/approvals/';

    const response = await apiClient.request(endpoint, { method: 'GET' });

    if (!response.ok) {
      throw new Error('Failed to fetch approvals');
    }

    const data = await response.json();
    return (data || []).map(transformApproval);
  }

  /**
   * Approve an approval item
   */
  async approve(id: string, payload?: ApprovalActionPayload): Promise<QueueApproval> {
    const response = await apiClient.request(`/approvals/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to approve item');
    }

    const data = await response.json();
    return transformApproval(data);
  }

  /**
   * Reject an approval item
   */
  async reject(id: string, payload?: ApprovalActionPayload): Promise<QueueApproval> {
    const response = await apiClient.request(`/approvals/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to reject item');
    }

    const data = await response.json();
    return transformApproval(data);
  }
}

export interface PrivacySettings {
  profile_visibility: boolean;
  profile_visibility_level: 'recruiters' | 'queue';
  contact_preference: 'platform' | 'email' | 'phone' | 'any';
  anonymous_analytics: boolean;
  third_party_integrations: boolean;
}

/**
 * Get the current user's privacy settings.
 */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  const response = await apiClient.request('/approvals/privacy/', { method: 'GET' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch privacy settings');
  }
  return response.json();
}

/**
 * Update the current user's privacy settings.
 */
export async function updatePrivacySettings(data: Partial<PrivacySettings>): Promise<PrivacySettings> {
  const response = await apiClient.request('/approvals/privacy/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to update privacy settings');
  }
  return response.json();
}

export const approvalService = new ApprovalService();
