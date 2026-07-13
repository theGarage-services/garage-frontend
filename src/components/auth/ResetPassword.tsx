import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { passwordResetService, PasswordStrengthData } from '../../api/passwordReset';

// Types
interface ResetPasswordProps {
  onBack: () => void;
  token?: string;
}

interface PasswordValidationResult {
  isValid: boolean;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

// Validation Hooks
function usePasswordValidation(password: string, confirmPassword: string, passwordStrength: PasswordStrengthData | null) {
  const validatePassword = (password: string): PasswordValidationResult => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?]/.test(password),
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    };
  };

  const canSubmit = (): boolean => {
    const basicValidation = validatePassword(password);
    const passwordsMatch = password === confirmPassword;
    const strengthValid = (passwordStrength?.strength?.score ?? 0) >= 3;
    const notReused = !passwordStrength?.history_violation;
    const noValidationErrors = !passwordStrength?.validation_errors || passwordStrength.validation_errors.length === 0;
    
    return basicValidation.isValid && passwordsMatch && strengthValid && notReused && noValidationErrors;
  };

  return { validatePassword, canSubmit };
}

// UI Components
function PasswordStrengthIndicator({ passwordStrength, isCheckingStrength }: Readonly<{
  passwordStrength: PasswordStrengthData | null;
  isCheckingStrength: boolean;
}>) {
  if (!passwordStrength) return null;

  const getStrengthColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-red-600';
    }
  };

  const getBarColor = (color: string) => {
    switch (color) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Password Strength</p>
        <span className={`text-sm font-medium ${getStrengthColor(passwordStrength.strength.color)}`}>
          {passwordStrength.strength.level}
          {isCheckingStrength && ' (checking...)'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor(passwordStrength.strength.color)}`}
          style={{ width: `${passwordStrength.strength.percentage}%` }}
        />
      </div>
    </div>
  );
}

function PasswordRequirements({ passwordValidation, passwordStrength }: Readonly<{
  passwordValidation: PasswordValidationResult;
  passwordStrength: PasswordStrengthData | null;
}>) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <PasswordStrengthIndicator passwordStrength={passwordStrength} isCheckingStrength={false} />

      <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
      <div className="space-y-1">
        <RequirementItem met={passwordValidation.requirements.length} text="At least 8 characters" />
        <RequirementItem met={passwordValidation.requirements.uppercase} text="Uppercase letter" />
        <RequirementItem met={passwordValidation.requirements.lowercase} text="Lowercase letter" />
        <RequirementItem met={passwordValidation.requirements.number} text="Number" />
        <RequirementItem met={passwordValidation.requirements.special} text="Special character" />
      </div>

      {passwordStrength && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Security Checks:</p>
          <SecurityCheck 
            met={passwordStrength.strength.score >= 3}
            metText="Strong enough"
            unmetText="Must be stronger (Good or Strong)"
          />
          <SecurityCheck 
            met={!passwordStrength.history_violation}
            metText="Not used before"
            unmetText="Cannot reuse recent password"
          />
          {passwordStrength.validation_errors && passwordStrength.validation_errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-600">Additional requirements:</p>
              {passwordStrength.validation_errors.map((error: string) => (
                <div key={error} className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: Readonly<{ met: boolean; text: string }>) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />}
      {text}
    </div>
  );
}

function SecurityCheck({ met, metText, unmetText }: Readonly<{ met: boolean; metText: string; unmetText: string }>) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-orange-600'}`}>
      {met ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {met ? metText : unmetText}
    </div>
  );
}

function InvalidTokenScreen({ error, onBack }: Readonly<{ error: string; onBack: () => void }>) {
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
            <Button onClick={onBack} variant="outline" className="w-full hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SuccessScreen({ onBack }: Readonly<{ onBack: () => void }>) {
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
            <Button onClick={onBack} className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResetPasswordForm({ 
  password, 
  confirmPassword, 
  setPassword, 
  setConfirmPassword, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword, 
  passwordValidation, 
  passwordStrength, 
  error, 
  isLoading, 
  canSubmit, 
  handleSubmit, 
  onBack 
}: Readonly<{
  password: string;
  confirmPassword: string;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  passwordValidation: PasswordValidationResult;
  passwordStrength: PasswordStrengthData | null;
  error: string;
  isLoading: boolean;
  canSubmit: () => boolean;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onBack: () => void;
}>) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="h-12 pr-12"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="h-12 pr-12"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {password && (
          <PasswordRequirements passwordValidation={passwordValidation} passwordStrength={passwordStrength} />
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !canSubmit()}
        className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Resetting Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>
    </form>
  );
}

export function ResetPassword({ onBack, token: propToken }: Readonly<ResetPasswordProps>) {
  // Get token from URL or prop
  const urlParams = new URLSearchParams(globalThis.location.search);
  const token = propToken || urlParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthData | null>(null);

  const { validatePassword, canSubmit } = usePasswordValidation(password, confirmPassword, passwordStrength);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
      return;
    }

    validateToken();
  }, [token]);

  useEffect(() => {
    if (password && password.length >= 3) {
      checkPasswordStrength();
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const checkPasswordStrength = async () => {
    try {
      const data = await passwordResetService.checkPasswordStrength(password);
      setPasswordStrength(data);
    } catch (error) {
      console.error('Error checking password strength:', error);
    }
  };

  const validateToken = () => {
    const isValid = passwordResetService.validateToken(token || '');
    setTokenValid(isValid);
    if (!isValid) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!canSubmit()) {
      setError('Please address all validation requirements before submitting');
      return;
    }

    setIsLoading(true);

    try {
      await passwordResetService.confirmPasswordReset({
        token: token || '',
        password,
        confirm_password: confirmPassword,
      });

      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return <InvalidTokenScreen error={error} onBack={onBack} />;
  }

  if (isSuccess) {
    return <SuccessScreen onBack={onBack} />;
  }

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <ArrowLeft className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">Reset your password</h2>
            <p className="text-gray-500">Enter your new password below</p>
          </div>

          <ResetPasswordForm
            password={password}
            confirmPassword={confirmPassword}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            passwordValidation={passwordValidation}
            passwordStrength={passwordStrength}
            error={error}
            isLoading={isLoading}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            onBack={onBack}
          />
        </Card>
      </div>
    </div>
  );
}
