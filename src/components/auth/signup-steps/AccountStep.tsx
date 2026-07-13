import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { SocialAuthOptions } from '../SocialAuthOptions';
import { AccountStepProps } from '@/types/auth/signup';

export function AccountStep({
  formData,
  errors,
  showPassword,
  showConfirmPassword,
  passwordCheck,
  onChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSocialAuth,
  userRole,
}: Readonly<AccountStepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
        <p className="text-gray-500">Let's start with the basics</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`h-12 border-2 ${errors.firstName ? 'border-red-300' : 'border-gray-200'}`}
          />
          {errors.firstName && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.firstName}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`h-12 border-2 ${errors.lastName ? 'border-red-300' : 'border-gray-200'}`}
          />
          {errors.lastName && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.lastName}
            </div>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={`h-12 border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
        />
        {errors.email && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            className={`h-12 border-2 pr-12 ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        {formData.password && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${passwordCheck.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" />
                8+ characters
              </div>
              <div className={`flex items-center gap-2 ${passwordCheck.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" />
                Uppercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordCheck.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" />
                Lowercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordCheck.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" />
                Number
              </div>
              <div className={`flex items-center gap-2 ${passwordCheck.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" />
                Special character
              </div>
            </div>
          </div>
        )}

        {errors.password && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.password}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            className={`h-12 border-2 pr-12 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => onChange('agreeToTerms', !!checked)}
          className="mt-1"
        />
        <div className="text-sm">
          <Label htmlFor="terms" className="text-gray-700 cursor-pointer">
            I agree to the{' '}
            <a href="/terms-of-service" className="text-[#ff6b35] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="text-[#ff6b35] hover:underline">Privacy Policy</a>
          </Label>
          {errors.agreeToTerms && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              {errors.agreeToTerms}
            </div>
          )}
        </div>
      </div>

      {/* Social Auth Options */}
      <SocialAuthOptions
        onSocialAuth={onSocialAuth}
        isLogin={false}
        userRole={userRole}
      />
    </div>
  );
}
