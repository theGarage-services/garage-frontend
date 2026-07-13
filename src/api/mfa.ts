import apiClient from './client';

export type MFAMethod = 'authenticator' | 'email' | 'sms';

export interface MFAStatus {
  enabled: boolean;
  preferred_method: MFAMethod;
  methods: {
    authenticator: boolean;
    email: boolean;
    sms: boolean;
  };
  delivery_targets: {
    email: string | null;
    sms: string | null;
  };
}

export interface MFASetupResponse {
  method: MFAMethod;
  enabled?: boolean;
  secret?: string;
  provisioning_uri?: string;
  masked_target?: string;
  expires_in_seconds?: number;
}

export interface MFALoginCodeResponse {
  method: MFAMethod;
  masked_target: string;
  expires_in_seconds: number;
}

export class MFAService {
  // Return the authenticated user's MFA status across all methods
  async getStatus(): Promise<MFAStatus> {
    const response = await apiClient.request('/accounts/mfa/status/', {
      method: 'GET',
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get MFA status');
  }

  // Start setup for a given MFA method
  async setup(method: MFAMethod = 'authenticator'): Promise<MFASetupResponse> {
    const response = await apiClient.request(
      `/accounts/mfa/setup/?method=${encodeURIComponent(method)}`,
      {
        method: 'GET',
      }
    );

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to start MFA setup');
  }

  // Confirm MFA setup with a 6-digit code
  async confirmSetup(method: MFAMethod, code: string): Promise<any> {
    const response = await apiClient.request('/accounts/mfa/setup/', {
      method: 'POST',
      body: JSON.stringify({ method, code }),
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to confirm MFA setup');
  }

  // Disable a specific MFA method (requires current password)
  async disable(method: MFAMethod, password: string): Promise<any> {
    const response = await apiClient.request('/accounts/mfa/disable/', {
      method: 'POST',
      body: JSON.stringify({ method, password }),
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to disable MFA');
  }

  // Send a login verification code to the chosen MFA method
  async sendLoginCode(token: string, method: MFAMethod): Promise<MFALoginCodeResponse> {
    const response = await apiClient.request('/accounts/mfa/login-code/', {
      method: 'POST',
      body: JSON.stringify({ token, method }),
      skipAuth: true as any,
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send login code');
  }

  // Verify a login MFA code using an MFA step token
  async verifyLoginMFA(token: string, method: MFAMethod, code: string): Promise<any> {
    const response = await apiClient.request('/accounts/mfa/login-verify/', {
      method: 'POST',
      body: JSON.stringify({ token, method, code }),
      skipAuth: true as any,
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to verify MFA');
  }
}

export const mfaService = new MFAService();
