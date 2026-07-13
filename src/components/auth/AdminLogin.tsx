import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Eye, EyeOff, Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import apiClient from '../../api/client';

interface AdminLoginProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function FormField({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  error, 
  onChange, 
  showPasswordToggle, 
  showPassword, 
  onTogglePassword 
}: Readonly<FormFieldProps>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 border-2 transition-all ${
            error 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-[#ff6b35]'
          } ${showPasswordToggle ? 'pr-12' : ''}`}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export function AdminLogin({ onLogin, onBack }: Readonly<AdminLoginProps>) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // Registration fields
    firstName: '',
    lastName: '',
    companyName: '',
    companyWebsite: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [demoAccounts, setDemoAccounts] = useState<Array<{email: string, label: string, color: string, subtitle?: string}>>([]);

  // Safe email regex - prevents ReDoS attacks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validateEmail = (email: string) => emailRegex.test(email);

  // Fetch demo accounts from backend on component mount
  useEffect(() => {
    const fetchDemoAccounts = async () => {
      try {
        // In development, use demo accounts
        if (import.meta.env.DEV) {
          const demoData = [
            { email: 'admin@thegarage.com', label: 'Admin', color: 'red' },
            { email: 'lead@thegarage.com', label: 'Lead', color: 'orange' },
            { email: 'manager@thegarage.com', label: 'Manager', color: 'purple' },
            { email: 'recruiter@thegarage.com', label: 'Recruiter', color: 'blue', subtitle: 'Needs Approval' },
            { email: 'recruiter-trusted@thegarage.com', label: 'Trusted Recruiter', color: 'green', subtitle: '✓ Direct Publish' },
            { email: 'hiring@thegarage.com', label: 'Hiring Manager', color: 'yellow' }
          ];
          setDemoAccounts(demoData);
        }
      } catch (error) {
        console.error('Failed to fetch demo accounts:', error);
      }
    };

    fetchDemoAccounts();
  }, []);

  const handleDemoLogin = (email: string) => {
    setFormData({ ...formData, email, password: 'demo123' }); // Default demo password
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const requiredFields = mode === 'register' 
      ? ['email', 'password', 'firstName', 'lastName', 'companyName', 'companyWebsite']
      : ['email', 'password'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Use backend registration
        const userData = {
          username: formData.email,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'job-seeker' // Default role
        };
        
        const response = await apiClient.register(userData);
        onLogin(response);
      } else {
        // Use backend login
        const response = await apiClient.login(formData.email, formData.password);
        onLogin(response);
      }
    } catch (error: any) {
      let message = error.message || 'Authentication failed. Please try again.';
      try {
        const errorData = JSON.parse(message);
        if (errorData.error === 'Account suspended') {
          message = errorData.details || 'Your account has been suspended due to fraud reports.';
        }
      } catch {
        // keep original message
      }
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFormErrors = () => {
    setLoginError('');
    setErrors({});
  };

  const setLoginMode = () => {
    setMode('login');
    clearFormErrors();
  };

  const setRegisterMode = () => {
    setMode('register');
    clearFormErrors();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Role Selection
          </button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-medium">
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
          </div>
          <h2 className="text-xl text-gray-700 mb-2">
            {mode === 'login' ? 'Welcome back, Enterprise!' : 'Register Your Organization'}
          </h2>
          <p className="text-gray-500">
            {mode === 'login' 
              ? 'Sign in to your enterprise account to continue' 
              : 'Create your enterprise organization account'}
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={setLoginMode}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#ff6b35] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={setRegisterMode}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#ff6b35] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Demo Login Buttons - Only show in login mode */}
          {mode === 'login' && Object.keys(demoAccounts).length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Demo Login ({Object.keys(demoAccounts).length} User Types):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account.email)}
                    className={`h-auto py-2 flex flex-col items-center gap-1 hover:border-${account.color}-600 hover:text-${account.color}-600`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-medium">{account.label}</span>
                    {account.subtitle && (
                      <span className={`text-[10px] ${account.color === 'green' ? 'text-green-600' : 'text-gray-500'}`}>
                        {account.subtitle}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Login Error */}
          {loginError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {loginError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration Fields - Only show in register mode */}
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    id="firstName"
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    error={errors.firstName}
                    onChange={(value) => handleChange('firstName', value)}
                  />
                  <FormField
                    id="lastName"
                    label="Last Name"
                    placeholder="Smith"
                    value={formData.lastName}
                    error={errors.lastName}
                    onChange={(value) => handleChange('lastName', value)}
                  />
                </div>
                <FormField
                  id="companyName"
                  label="Company Name"
                  placeholder="Acme Corporation"
                  value={formData.companyName}
                  error={errors.companyName}
                  onChange={(value) => handleChange('companyName', value)}
                />
                <FormField
                  id="companyWebsite"
                  label="Company Website"
                  type="url"
                  placeholder="https://acmecorp.com"
                  value={formData.companyWebsite}
                  error={errors.companyWebsite}
                  onChange={(value) => handleChange('companyWebsite', value)}
                />
              </>
            )}

            {/* Email */}
            <FormField
              id="email"
              label="Email Address"
              type="email"
              placeholder={mode === 'login' ? 'master@thegarage.com' : 'admin@acmecorp.com'}
              value={formData.email}
              error={errors.email}
              onChange={(value) => handleChange('email', value)}
            />

            {/* Password */}
            <FormField
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              error={errors.password}
              onChange={(value) => handleChange('password', value)}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white font-medium transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  {mode === 'register' ? 'Creating Organization...' : 'Signing In...'}
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {mode === 'register' ? 'Create Organization' : 'Sign In to Enterprise'}
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700 text-center">
              🔒 Enterprise portal with complete organizational access
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
