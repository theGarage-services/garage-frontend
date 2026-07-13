import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface TokenInvalidScreenProps {
  error: string;
  onBack: () => void;
}

export function TokenInvalidScreen({ error, onBack }: Readonly<TokenInvalidScreenProps>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={onBack} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface SuccessScreenProps {
  onBack: () => void;
}

export function SuccessScreen({ onBack }: Readonly<SuccessScreenProps>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-gray-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onBack}
              className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
