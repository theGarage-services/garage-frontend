import { useEffect, useState } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface VerifyEmailLinkProps {
  token?: string;
  onBack?: () => void;
}

export function VerifyEmailLink({ token: propToken, onBack }: Readonly<VerifyEmailLinkProps>) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    // Use token from props if provided, otherwise fall back to URL search params
    const token = propToken || new URLSearchParams(globalThis.location.search).get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/verify-email/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now continue with your registration.');
          // Don't navigate automatically - let the user click continue
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Token may have expired.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [propToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-[95vw] sm:max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 text-[#ff6b35] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">You can now continue with your registration.</p>
            <Button
              onClick={onBack || (() => globalThis.location.href = '/')}
              className="w-full"
            >
              Continue to Sign Up
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert className="bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 ml-3">{message}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button
                onClick={onBack || (() => globalThis.location.href = '/')}
                variant="outline"
                className="w-full"
              >
                Back to Sign Up
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
