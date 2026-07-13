import apiClient from './client';
import type { MFAMethod } from './mfa';

export interface OAuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tier?: string;
  profile_complete?: boolean;
}

export interface OAuthResponse {
  message: string;
  user?: OAuthUser;
  created?: boolean;
  mfa_required?: boolean;
  mfa_token?: string;
  preferred_method?: MFAMethod;
  available_methods?: MFAMethod[];
}

export class OAuthService {
  // Initiate Google OAuth login
  async initiateGoogleOAuth() {
    const response = await apiClient.request('/accounts/oauth/google/', {
      method: 'GET',
      skipAuth: true,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('Failed to initiate OAuth');
  }

  // Handle OAuth callback
  async handleOAuthCallback(code: string, state: string, role: string = 'job-seeker'): Promise<OAuthResponse> {
    const response = await apiClient.request(`/accounts/oauth/callback/?code=${code}&state=${state}&role=${role}`, {
      method: 'GET',
      skipAuth: true,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    const errorData = await response.json().catch(() => ({ details: 'Unknown error' }));
    throw new Error(errorData.details || 'OAuth callback failed');
  }

  // Store OAuth tokens (for future use)
  async storeOAuthTokens(tokens: any) {
    const response = await apiClient.request('/accounts/oauth/complete-post/', {
      method: 'POST',
      body: JSON.stringify({ tokens }),
      skipAuth: true,
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to store OAuth tokens');
  }

  // Redirect to Google OAuth
  redirectToGoogleOAuth(role?: string) {
    this.initiateGoogleOAuth()
      .then((data) => {
        // Store state and role in session storage for verification
        sessionStorage.setItem('oauth_state', data.state);
        if (role) {
          sessionStorage.removeItem('oauth_role');
          sessionStorage.setItem('oauth_role', role);
        }

        // Redirect to Google authorization URL
        globalThis.location.href = data.authorization_url;
      })
      .catch((error) => {
        throw error;
      });
  }

  // Handle OAuth callback from redirect
  async handleOAuthRedirect(role?: string) {
    
    // Get role from parameter or session storage
    const urlRole = new URLSearchParams(globalThis.location.search).get('role');
    const sessionRole = sessionStorage.getItem('oauth_role');
    
    
    
    // Use the first available role source, no default fallback
    const finalRole = role || urlRole || sessionRole;
    
    
    if (!finalRole) {
      throw new Error('No role found for OAuth authentication');
    }
    
    const urlParams = new URLSearchParams(globalThis.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');


    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing OAuth callback parameters');
    }

    // Verify state matches
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (!storedState || storedState !== state) {
      throw new Error('Invalid OAuth state');
    }

    const oauthResponse = await this.handleOAuthCallback(code, state, finalRole);

    // Backend sets tokens as httpOnly cookies; just clear local OAuth state.
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_role');

    // Clean up URL
    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);

    return oauthResponse;
  }
}

// Export singleton instance
export const oauthService = new OAuthService();
