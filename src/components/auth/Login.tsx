import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Eye, EyeOff, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { SocialAuthOptions } from './SocialAuthOptions';
import { authService } from '../../api/auth';
import { mfaService, type MFAMethod } from '../../api/mfa';

type UserRole = 'job-seeker' | 'recruiter' | 'admin';

const METHOD_LABELS: Record<MFAMethod, string> = {
  authenticator: 'Authenticator App',
  email: 'Email',
  sms: 'SMS',
};

interface LoginProps {
  onLogin: (userData: any, role: UserRole) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onBack?: () => void;
  userRole: UserRole;
}

function validateEmail(email: string) {
  // Safe email regex - prevents ReDoS attacks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function parseLoginError(error: any): string {
  if (!error.message) {
    return 'Invalid email or password. Please try again.';
  }

  try {
    const errorData = JSON.parse(error.message);

    if (errorData.error === 'Account locked') {
      const remainingMinutes = errorData.remaining_minutes;
      const sessionNumber = errorData.session_number || 1;
      const timeString = remainingMinutes < 60
        ? `${remainingMinutes} minutes`
        : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`;
      return `Account locked due to too many failed attempts (Session ${sessionNumber}). Please try again in ${timeString}.`;
    }

    if (errorData.error === 'Account not found') {
      return errorData.details || 'Account not found for this role.';
    }

    if (errorData.error === 'Account suspended') {
      return errorData.details || 'Your account has been suspended due to fraud reports.';
    }

    return errorData.details || 'Invalid email or password. Please try again.';
  } catch {
    return error.message;
  }
}

interface PasswordFormProps {
  formData: { email: string; password: string };
  errors: Record<string, string>;
  showPassword: boolean;
  isLoading: boolean;
  loginError: string;
  onChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

function PasswordForm({
  formData,
  errors,
  showPassword,
  isLoading,
  loginError,
  onChange,
  onTogglePassword,
  onForgotPassword,
  onSubmit,
}: Readonly<PasswordFormProps>) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700">
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`pl-4 pr-4 h-12 border-2 transition-all ${
              errors.email
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-[#ff6b35]'
            }`}
          />
        </div>
        {errors.email && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            className={`pl-4 pr-12 h-12 border-2 transition-all ${
              errors.password
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-[#ff6b35]'
            }`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.password}
          </div>
        )}
      </div>

      {/* Login Error */}
      {loginError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {loginError}
          </AlertDescription>
        </Alert>
      )}

      {/* Forgot Password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-[#ff6b35] hover:text-[#e55a2b] transition-colors"
        >
          Forgot your password?
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Signing in...
          </div>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
}

interface MFAFormProps {
  mfaMethod: MFAMethod | '';
  availableMethods: MFAMethod[];
  preferredMethod: MFAMethod | '';
  mfaCode: string;
  mfaCodeTarget: string;
  mfaLoading: boolean;
  mfaError: string;
  onMethodChange: (method: MFAMethod) => void;
  onSendCode: () => void;
  onChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

function MFAForm({
  mfaMethod,
  availableMethods,
  preferredMethod,
  mfaCode,
  mfaCodeTarget,
  mfaLoading,
  mfaError,
  onMethodChange,
  onSendCode,
  onChange,
  onSubmit,
  onCancel,
}: Readonly<MFAFormProps>) {
  const needsCode = mfaMethod === 'authenticator' || mfaCodeTarget !== '';
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-6 h-6 text-[#ff6b35]" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
        <p className="text-sm text-gray-600">
          Choose how you would like to verify your identity.
        </p>
      </div>

      {availableMethods.length > 1 && (
        <div className="space-y-2">
          <Label className="text-gray-700">Verification method</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {availableMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => onMethodChange(method)}
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
        </div>
      )}

      {mfaMethod && mfaMethod !== 'authenticator' && !mfaCodeTarget && (
        <Button
          type="button"
          onClick={onSendCode}
          disabled={mfaLoading}
          className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium"
        >
          {mfaLoading ? 'Sending...' : `Send code to ${METHOD_LABELS[mfaMethod]}`}
        </Button>
      )}

      {needsCode && (
        <div className="space-y-2">
          <Label htmlFor="mfa-code" className="text-gray-700">
            {mfaMethod === 'authenticator' ? 'Authenticator Code' : 'Verification Code'}
          </Label>
          {mfaCodeTarget && (
            <p className="text-xs text-gray-500">A code was sent to {mfaCodeTarget}.</p>
          )}
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => onChange(e.target.value)}
            className="h-12 border-2 border-gray-200 focus:border-[#ff6b35] text-center tracking-widest text-lg"
            disabled={mfaLoading}
            autoFocus
          />
        </div>
      )}

      {mfaError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{mfaError}</AlertDescription>
        </Alert>
      )}

      {needsCode && (
        <Button
          type="submit"
          disabled={mfaLoading || mfaCode.length < 6}
          className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium transition-all duration-200"
        >
          {mfaLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Verifying...
            </div>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={mfaLoading}
        className="w-full h-12"
      >
        Cancel
      </Button>
    </form>
  );
}

function useLogin(
  userRole: UserRole,
  onLogin: (userData: any, role: UserRole) => void
) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaMethod, setMfaMethod] = useState<MFAMethod | ''>('');
  const [availableMethods, setAvailableMethods] = useState<MFAMethod[]>([]);
  const [preferredMethod, setPreferredMethod] = useState<MFAMethod | ''>('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaCodeTarget, setMfaCodeTarget] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password, userRole);
      if (response.mfa_required && response.mfa_token) {
        const methods: MFAMethod[] = response.available_methods || ['authenticator'];
        const preferred: MFAMethod = response.preferred_method || methods[0] || 'authenticator';
        setMfaStep(true);
        setMfaToken(response.mfa_token);
        setAvailableMethods(methods);
        setPreferredMethod(preferred);
        setMfaMethod(preferred);
        setMfaCode('');
        setMfaCodeTarget('');
        return;
      }
      const determinedRole = response.user?.role || userRole;
      onLogin({
        ...response.user,
        role: response.user?.role || userRole,
        tier: response.user?.tier || 'basic',
        profileComplete: response.user?.profile_complete ?? false,
      }, determinedRole);
    } catch (error: any) {
      setLoginError(parseLoginError(error));
    } finally {
      setIsLoading(false);
    }
  }, [formData, userRole, onLogin, validateForm]);

  const handleSocialAuth = useCallback(async (provider: string, userData: any) => {
    if (!userData) {
      setLoginError(`Failed to sign in with ${provider}. Please try again.`);
      return;
    }
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLogin({ ...userData, profileComplete: true }, userRole);
    } catch (error) {
      console.error('Failed to sign in with social provider:', error);
      setLoginError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, onLogin]);

  const handleSendCode = useCallback(async () => {
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
  }, [mfaToken, mfaMethod]);

  const handleVerifyMFA = useCallback(async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      const userData = response.user;
      const determinedRole = userData?.role || userRole;
      onLogin({
        ...userData,
        role: determinedRole,
        tier: userData?.tier || 'basic',
        profileComplete: userData?.profile_complete ?? false,
      }, determinedRole);
    } catch (error: any) {
      setMfaError(error.message || 'Failed to verify MFA code');
    } finally {
      setMfaLoading(false);
    }
  }, [mfaCode, mfaToken, mfaMethod, userRole, onLogin]);

  const handleCancelMFA = useCallback(() => {
    setMfaStep(false);
    setMfaToken('');
    setMfaMethod('');
    setAvailableMethods([]);
    setPreferredMethod('');
    setMfaCode('');
    setMfaCodeTarget('');
    setMfaError('');
  }, []);

  const handleMethodChange = useCallback((method: MFAMethod) => {
    setMfaMethod(method);
    setMfaCode('');
    setMfaCodeTarget('');
    setMfaError('');
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) setLoginError('');
  }, [errors, loginError]);

  return {
    formData, errors, showPassword, setShowPassword, isLoading, loginError,
    mfaStep, mfaToken, mfaMethod, availableMethods, preferredMethod, mfaCode, setMfaCode,
    mfaCodeTarget, mfaLoading, mfaError,
    handleChange, handleSubmit, handleSocialAuth, handleSendCode, handleVerifyMFA, handleCancelMFA,
    handleMethodChange,
  };
}

export function Login({ onLogin, onSwitchToSignUp, onForgotPassword, onBack, userRole }: Readonly<LoginProps>) {
  const {
    formData, errors, showPassword, setShowPassword, isLoading, loginError,
    mfaStep, mfaMethod, availableMethods, preferredMethod, mfaCode, setMfaCode,
    mfaCodeTarget, mfaLoading, mfaError,
    handleChange, handleSubmit, handleSocialAuth, handleSendCode, handleVerifyMFA, handleCancelMFA,
    handleMethodChange,
  } = useLogin(userRole, onLogin);

  const title = mfaStep
    ? 'Verify Your Identity'
    : `Welcome back${userRole === 'recruiter' ? ', Recruiter' : ''}!`;
  const subtitle = mfaStep
    ? 'Two-factor authentication is required for this account.'
    : `Sign in to your ${userRole === 'recruiter' ? 'recruiter' : 'job seeker'} account to continue`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && !mfaStep && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Role Selection
            </button>
          )}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-medium">
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-700 mb-2">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        {/* Login / MFA Form */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {mfaStep ? (
            <MFAForm
              mfaMethod={mfaMethod}
              availableMethods={availableMethods}
              preferredMethod={preferredMethod}
              mfaCode={mfaCode}
              mfaCodeTarget={mfaCodeTarget}
              mfaLoading={mfaLoading}
              mfaError={mfaError}
              onMethodChange={handleMethodChange}
              onSendCode={handleSendCode}
              onChange={setMfaCode}
              onSubmit={handleVerifyMFA}
              onCancel={handleCancelMFA}
            />
          ) : (
            <>
              <PasswordForm
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                isLoading={isLoading}
                loginError={loginError}
                onChange={handleChange}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onForgotPassword={onForgotPassword}
                onSubmit={handleSubmit}
              />

              {/* Social Auth Options */}
              <SocialAuthOptions
                onSocialAuth={handleSocialAuth}
                isLogin={true}
                userRole={userRole}
              />

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToSignUp}
                    className="text-[#ff6b35] hover:text-[#e55a2b] font-medium transition-colors"
                  >
                    Sign up for free
                  </button>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}