import { useState, useEffect, useRef } from 'react';
import { oauthService } from '../../api/oauth';
import { mfaService, type MFAMethod } from '../../api/mfa';

const METHOD_LABELS: Record<MFAMethod, string> = {
  authenticator: 'Authenticator App',
  email: 'Email',
  sms: 'SMS',
};

interface OAuthCallbackProps {
  onOAuthSuccess: (userData: any) => void;
  onOAuthError: (error: string) => void;
  role?: string; // Add role parameter
}

export function OAuthCallback({ onOAuthSuccess, onOAuthError, role }: Readonly<OAuthCallbackProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCreated, setMfaCreated] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<MFAMethod | ''>('');
  const [availableMethods, setAvailableMethods] = useState<MFAMethod[]>([]);
  const [preferredMethod, setPreferredMethod] = useState<MFAMethod | ''>('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaCodeTarget, setMfaCodeTarget] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const isProcessingRef = useRef(false); // NEW: Use ref for more reliable prevention


  useEffect(() => {
    const handleOAuthCallback = async () => {
      // NEW: Prevent double calls due to React Strict Mode using ref
      if (isProcessingRef.current) {
        return;
      }
      
      isProcessingRef.current = true;
      
      try {
        
        if (!role) {
          throw new Error('No role provided for OAuth authentication');
        }
        
        // Check URL parameters first
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

        const oauthResponse = await oauthService.handleOAuthRedirect(role);

        if (oauthResponse.mfa_required && oauthResponse.mfa_token) {
          const methods: MFAMethod[] = oauthResponse.available_methods || ['authenticator'];
          const preferred: MFAMethod = oauthResponse.preferred_method || methods[0] || 'authenticator';
          setMfaToken(oauthResponse.mfa_token);
          setMfaCreated(oauthResponse.created ?? false);
          setAvailableMethods(methods);
          setPreferredMethod(preferred);
          setMfaMethod(preferred);
          setMfaCode('');
          setMfaCodeTarget('');
          setMfaStep(true);
          setIsLoading(false);
          return;
        }

        if (!oauthResponse.user) {
          throw new Error('OAuth response did not include user data');
        }

        // Transform OAuth response to match expected user data format
        // Spread the full backend user payload so fields like company_memberships are preserved
        const userData = {
          ...oauthResponse.user,
          created: oauthResponse.created, // NEW: Pass created flag from backend
          profileComplete: oauthResponse.user.profile_complete ?? !oauthResponse.created,
          provider: 'google',
        };

        onOAuthSuccess(userData);
      } catch (error: any) {
        setError(error.message || 'OAuth authentication failed');
        onOAuthError(error.message || 'OAuth authentication failed');
      } finally {
        setIsLoading(false);
        // No need to reset ref since component will unmount anyway
      }
    };

    handleOAuthCallback();
  }, [onOAuthSuccess, onOAuthError, role]);

  const handleSendCode = async () => {
    setMfaError('');
    if (!mfaMethod) {
      setMfaError('Please select a verification method');
      return;
    }
    setMfaLoading(true);
    try {
      const response = await mfaService.sendLoginCode(mfaToken, mfaMethod);
      setMfaCodeTarget(response.masked_target);
    } catch (error: any) {
      setMfaError(error.message || 'Failed to send verification code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    setMfaError('');
    if (!mfaMethod) {
      setMfaError('Please select a verification method');
      return;
    }
    if (!mfaCode || mfaCode.length < 6) {
      setMfaError('Please enter the 6-digit verification code');
      return;
    }

    setMfaLoading(true);
    try {
      const response = await mfaService.verifyLoginMFA(mfaToken, mfaMethod, mfaCode);
      const created = response.user?.created ?? mfaCreated;
      const userData = {
        ...response.user,
        created,
        profileComplete: response.user?.profile_complete ?? !created,
        provider: 'google',
      };
      onOAuthSuccess(userData);
    } catch (error: any) {
      setMfaError(error.message || 'Failed to verify MFA code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleCancelMFA = () => {
    setMfaStep(false);
    setMfaToken('');
    setMfaCreated(false);
    setMfaMethod('');
    setAvailableMethods([]);
    setPreferredMethod('');
    setMfaCode('');
    setMfaCodeTarget('');
    setMfaError('');
    onOAuthError('MFA verification was cancelled');
  };

  if (mfaStep) {
    const needsCode = mfaMethod === 'authenticator' || mfaCodeTarget !== '';
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[95vw] sm:max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-600">
              Choose how you would like to verify your identity.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl space-y-6">
            {availableMethods.length > 1 && (
              <fieldset className="space-y-2">
                <legend className="block text-sm font-medium text-gray-700">Verification method</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {availableMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setMfaMethod(method);
                        setMfaCode('');
                        setMfaCodeTarget('');
                      }}
                      disabled={mfaLoading}
                      className={`px-2 py-2 text-sm rounded-lg border transition-colors ${
                        mfaMethod === method
                          ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff6b35]'
                      }`}
                    >
                      {METHOD_LABELS[method]}
                      {preferredMethod === method && (
                        <span className="block text-[10px] opacity-80">Preferred</span>
                      )}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {mfaMethod && mfaMethod !== 'authenticator' && !mfaCodeTarget && (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={mfaLoading}
                className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {mfaLoading ? 'Sending...' : `Send code to ${METHOD_LABELS[mfaMethod]}`}
              </button>
            )}

            {needsCode && (
              <div className="space-y-2">
                <label htmlFor="oauth-mfa-code" className="block text-sm font-medium text-gray-700">
                  {mfaMethod === 'authenticator' ? 'Authenticator Code' : 'Verification Code'}
                </label>
                {mfaCodeTarget && (
                  <p className="text-xs text-gray-500">A code was sent to {mfaCodeTarget}.</p>
                )}
                <input
                  id="oauth-mfa-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-[#ff6b35] focus:outline-none text-center tracking-widest text-lg"
                  disabled={mfaLoading}
                  autoFocus
                />
              </div>
            )}

            {mfaError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {mfaError}
              </div>
            )}

            {needsCode && (
              <button
                type="button"
                onClick={handleVerifyMFA}
                disabled={mfaLoading || mfaCode.length < 6}
                className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {mfaLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Verifying...
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleCancelMFA}
              disabled={mfaLoading}
              className="w-full h-12 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-[95vw] sm:max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">OAuth Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => globalThis.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing Google sign-in...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we authenticate your account</p>
        </div>
      </div>
    );
  }

  return null; // This component will redirect or be unmounted after callback
}
