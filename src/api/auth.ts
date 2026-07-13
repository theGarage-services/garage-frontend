import apiClient from './client';
import type { MFAMethod } from './mfa';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: 'job-seeker' | 'recruiter';
  tier?: 'basic' | 'premium' | 'admin';
  profile_complete?: boolean;
}

export interface LoginResponse {
  user?: User;
  mfa_required?: boolean;
  mfa_token?: string;
  preferred_method?: MFAMethod;
  available_methods?: MFAMethod[];
  message?: string;
}

export class AuthService {
  // Login with email/password
  async login(email: string, password: string, role?: string): Promise<LoginResponse> {
    return await apiClient.login(email, password, role);
  }

  // Register new user
  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  } | FormData) {
    return await apiClient.register(userData);
  }

  // Logout user
  async logout(): Promise<void> {
    await apiClient.logout();
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiClient.getProfile();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated (UX convenience flag only)
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<any> {
    return await apiClient.requestPasswordReset(email);
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    return await apiClient.updateProfile(userData);
  }

  // Update OAuth user profile with role-specific data
  // Supports both JSON and FormData (for file uploads like resume)
  async updateOAuthProfile(profileData: any, role: string, resumeFile?: File | null): Promise<any> {
    // Check if we need to send FormData (for file upload) or JSON
    const hasFile = resumeFile instanceof File;

    let body: FormData | string;
    let headers: Record<string, string> | undefined;

    if (hasFile) {
      // Build FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('role', role);

      // Add all profile fields
      Object.keys(profileData).forEach(key => {
        const value = profileData[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add resume file
      formData.append('resume_file', resumeFile);
      body = formData;
      // Don't set Content-Type - browser will set it with boundary
      headers = undefined;
    } else {
      // JSON request
      body = JSON.stringify({
        ...profileData,
        role: role
      });
      headers = { 'Content-Type': 'application/json' };
    }

    const response = await apiClient.request('/accounts/update-profile/', {
      method: 'POST',
      body,
      headers,
      skipAuth: true, // Skip auth for OAuth completion
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update OAuth profile');
  }
}

// Export singleton instance
export const authService = new AuthService();
