import apiClient from './client';

export interface Session {
  id: number;
  user_agent: string;
  ip_address: string | null;
  location: string;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

export class SessionService {
  async listSessions(): Promise<Session[]> {
    const response = await apiClient.request('/accounts/sessions/', {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data.sessions || [];
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load sessions');
  }

  async revokeSession(sessionId: number): Promise<void> {
    const response = await apiClient.request(`/accounts/sessions/${sessionId}/revoke/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to revoke session');
    }
  }
}

export const sessionService = new SessionService();
