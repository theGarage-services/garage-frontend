import { User } from "./auth";

// API client for Django backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  baseURL: any;
  // Tokens are stored in httpOnly Secure SameSite cookies by the backend.
  // The frontend no longer keeps them in sessionStorage or memory.
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Mark the frontend auth state as logged in. This is only a UX convenience
  // flag; the real credential lives in the httpOnly cookie.
  private setAuthState(authenticated: boolean) {
    try {
      if (authenticated) {
        sessionStorage.setItem('auth_state', '1');
      } else {
        sessionStorage.removeItem('auth_state');
      }
    } catch {
      // ignore storage errors
    }
  }

  // Make authenticated requests
  async request(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Only set default Content-Type if not FormData and not already set
    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...options.headers as Record<string, string>,
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token (but NOT for auth endpoints)
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const retryConfig: RequestInit = {
          ...config,
          headers,
        };
        return fetch(url, retryConfig);
      }
    }

    return response;
  }

  // Refresh access token using the httpOnly refresh cookie
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        this.setAuthState(true);
        return true;
      } else {
        this.setAuthState(false);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.setAuthState(false);
      return false;
    }
  }

  // Authentication methods
  async login(email: string, password: string, role?: string) {
    const url = `${this.baseURL}/auth/login/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.mfa_required) {
        this.setAuthState(true);
      }
      return data;
    } else {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorJson = await response.json();
        throw new Error(JSON.stringify(errorJson));
      } else {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
    }
  }

  async requestPasswordReset(email: string) {
    const response = await this.request('/accounts/password/reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true as any,
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send password reset email');
    }
  }

  private async parseErrorResponse(response: Response): Promise<Error> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const errorJson: unknown = await response.json();
      if (typeof errorJson === 'string') {
        return new TypeError(errorJson);
      }
      if (errorJson && typeof errorJson === 'object') {
        const obj = errorJson as Record<string, unknown>;
        if (typeof obj.detail === 'string') {
          return new Error(obj.detail);
        }
        if (typeof obj.message === 'string') {
          return new Error(obj.message);
        }
        const formatErrorValue = (value: unknown): string => {
          switch (typeof value) {
            case 'string':
              return value;
            case 'number':
            case 'bigint':
            case 'boolean':
              return String(value);
            case 'undefined':
              return 'undefined';
            case 'object':
              if (value === null) return 'null';
              if (Array.isArray(value)) return value.join(', ');
              return JSON.stringify(value);
            case 'function':
            case 'symbol':
              return '[unserializable]';
            default:
              return '[unknown]';
          }
        };
        const errorMessages = Object.entries(obj).map(
          ([key, value]) => `${key}: ${formatErrorValue(value)}`
        );
        return new Error(errorMessages.join('; '));
      }
    }

    const text = await response.text();
    const trimmedText = text.trim().toLowerCase();
    if (trimmedText.startsWith('<!doctype html') || trimmedText.startsWith('<html')) {
      return new Error(`Server error (${response.status}). Please try again.`);
    }
    return new Error(text || `HTTP ${response.status}`);
  }

  async register(userData: { username: string; email: string; password: string; password_confirm: string; first_name: string; last_name: string; } | FormData) {
    const response = await this.request('/accounts/register/', {
      method: 'POST',
      body: userData instanceof FormData ? userData : JSON.stringify(userData),
      headers: userData instanceof FormData ? {} : { 'Content-Type': 'application/json' },
      skipAuth: true as any,
    });

    if (response.ok) {
      const data = await response.json();
      // Backend issues tokens as httpOnly cookies on successful registration.
      this.setAuthState(true);
      return data;
    }
    throw await this.parseErrorResponse(response);
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.setAuthState(false);
    }
  }

  isAuthenticated(): boolean {
    // This is a UX convenience flag only; the real token is in the httpOnly cookie.
    try {
      return sessionStorage.getItem('auth_state') === '1';
    } catch {
      return false;
    }
  }

  // User profile methods
  async getProfile() {
    const response = await this.request('/accounts/profile/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch profile');
  }

  async updateProfile(userData: Partial<User>) {
    const response = await this.request('/accounts/profile/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update profile');
  }

  // Jobs management
  async getJobs() {
    const response = await this.request('/accounts/jobs/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch jobs');
  }

  async createJob(jobData: any) {
    const response = await this.request('/accounts/jobs/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create job');
  }

  async updateJob(jobId: any, jobData: any) {
    const response = await this.request(`/accounts/jobs/${jobId}/`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update job');
  }

  async deleteJob(jobId: any) {
    const response = await this.request(`/accounts/jobs/${jobId}/`, {
      method: 'DELETE',
    });

    if (response.ok) {
      return true;
    }
    throw new Error('Failed to delete job');
  }

  // Queues management
  async getQueues() {
    const response = await this.request('/accounts/queues/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch queues');
  }

  async createQueue(queueData: any) {
    const response = await this.request('/accounts/queues/', {
      method: 'POST',
      body: JSON.stringify(queueData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create queue');
  }

  // User statistics
  async getStats() {
    const response = await this.request('/accounts/stats/');
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch stats');
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;
