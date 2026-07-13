import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../api/auth';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: Readonly<ForgotPasswordProps>) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Safe email regex - prevents ReDoS attacks
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call the real forgot password API
      await authService.requestPasswordReset(email);
      setIsEmailSent(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[95vw] sm:max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600">
                We've sent password reset instructions to:
              </p>
              <p className="font-medium text-gray-900 mt-1">{email}</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>

              <div className="text-sm text-gray-500">
                <p>Didn't receive the email? Check your spam folder or</p>
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  className="text-[#ff6b35] hover:underline font-medium"
                >
                  try again with a different email
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-medium">
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-700 mb-2">Reset your password</h2>
          <p className="text-gray-500">Enter your email and we'll send you reset instructions</p>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`h-12 border-2 transition-all ${
                  error 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-[#ff6b35]'
                }`}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending instructions...
                </div>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Instructions
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full hover:text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}