import { useState } from 'react';
import { authService } from '@/api/auth';
import { SignupFormData, SignupStep, UserRole, FormErrors, FormFieldValue } from '@/types/auth/signup';
import { validateAccountStep, validateProfileStep, validatePassword } from '@/utils/auth/validation';

interface UseSignUpProps {
  userRole: UserRole;
  isOAuthUser: boolean;
  isEmailVerified: boolean;
  oauthUserData: any;
}

interface UseSignUpReturn {
  step: SignupStep;
  formData: SignupFormData;
  errors: FormErrors;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  signUpError: string;
  accountCreated: boolean;
  passwordCheck: ReturnType<typeof validatePassword>;
  setStep: (step: SignupStep) => void;
  setErrors: (errors: FormErrors) => void;
  setSignUpError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
  setAccountCreated: (created: boolean) => void;
  handleChange: (field: string, value: FormFieldValue) => void;
  handleTogglePassword: () => void;
  handleToggleConfirmPassword: () => void;
  validateAndProceedAccount: () => boolean;
  validateAndProceedProfile: () => boolean;
  createAccount: () => Promise<void>;
  buildUserData: (options: { isOAuth?: boolean; isEmailVerified?: boolean; isNewUser?: boolean; resumeSkipped?: boolean }) => any;
  resetError: (field: string) => void;
}

const getInitialStep = (isOAuthUser: boolean, isEmailVerified: boolean, userRole: UserRole): SignupStep => {
  if (!isOAuthUser && !isEmailVerified) return 'account';
  // OAuth users already have an account; start them at the first remaining
  // profile-completion step for their role.
  return userRole === 'job-seeker' ? 'resume' : 'profile';
};

const getInitialFormData = (isOAuthUser: boolean, isEmailVerified: boolean, oauthUserData: any): SignupFormData => ({
  // Account Info
  firstName: (isOAuthUser || isEmailVerified) ? (oauthUserData?.first_name || '') : '',
  lastName: (isOAuthUser || isEmailVerified) ? (oauthUserData?.last_name || '') : '',
  email: (isOAuthUser || isEmailVerified) ? (oauthUserData?.email || '') : '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,

  // Profile Info (Job Seeker)
  jobTitle: '',
  experience: '',
  location: '',
  bio: '',
  skills: '',
  phone: '',
  
  // Optional social links and professional info
  linkedin: '',
  github: '',
  portfolio: '',
  currentCompany: '',
  
  // Optional JSON fields
  projects: [],
  certifications: [],
  education: [],
  work_history: [],

  // Company Info (Recruiter)
  company: '',
  companySize: '',
  department: '',
  industry: '',
  website: '',
  institution: null,

  // Profile Image (Recruiter & Job Seeker)
  profileImage: '',

  // Job Preferences (Job Seeker)
  preferredLocations: ['No Preference'],
  preferredSalaryRanges: ['No Preference'],
  preferredJobTypes: ['No Preference'],
  preferredWorkArrangements: ['No Preference'],

  // Resume
  resumeFile: null,
  resumeText: '',
});

export function useSignUp({ userRole, isOAuthUser, isEmailVerified, oauthUserData }: UseSignUpProps): UseSignUpReturn {
  const [step, setStep] = useState<SignupStep>(getInitialStep(isOAuthUser, isEmailVerified, userRole));
  const [formData, setFormData] = useState<SignupFormData>(getInitialFormData(isOAuthUser, isEmailVerified, oauthUserData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [accountCreated, setAccountCreated] = useState(isOAuthUser || isEmailVerified);

  const passwordCheck = validatePassword(formData.password);

  const handleChange = (field: string, value: FormFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (signUpError) setSignUpError('');
  };

  const resetError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTogglePassword = () => setShowPassword(prev => !prev);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  const validateAndProceedAccount = (): boolean => {
    const newErrors = validateAccountStep(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAndProceedProfile = (): boolean => {
    const newErrors = validateProfileStep(formData, userRole);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAccount = async (): Promise<void> => {
    if (accountCreated) {
      setSignUpError('Account already created. Please check your email for verification, then continue to complete your profile.');
      return;
    }

    setIsLoading(true);
    setSignUpError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.email);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('password_confirm', formData.confirmPassword);
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('role', userRole);

      if (userRole === 'recruiter') {
        appendRecruiterDefaults(formDataToSend);
      } else if (userRole === 'job-seeker') {
        appendJobSeekerDefaults(formDataToSend);
      }

      await authService.register(formDataToSend);
      setAccountCreated(true);
      setSignUpError('Account created successfully! Please check your email for verification, then continue to complete your profile.');

      setTimeout(() => {
        setStep(userRole === 'recruiter' ? 'profile' : 'resume');
        setSignUpError('');
      }, 2000);
    } catch (error: any) {
      setSignUpError(error.message || 'An error occurred during account creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const appendRecruiterDefaults = (formDataToSend: FormData): void => {
    formDataToSend.append('location', 'TBD');
    formDataToSend.append('bio', 'Recruiter account created');
    formDataToSend.append('company', 'TBD');
    formDataToSend.append('company_size', '1-10');
    formDataToSend.append('industry', 'technology');
    formDataToSend.append('department', 'TBD');
    formDataToSend.append('website', '');
    formDataToSend.append('institution', JSON.stringify({ verified: false, type: 'startup' }));
  };

  const appendJobSeekerDefaults = (formDataToSend: FormData): void => {
    formDataToSend.append('job_title', 'TBD');
    formDataToSend.append('experience', 'L1');
    formDataToSend.append('location', 'TBD');
    formDataToSend.append('bio', 'Job seeker account created');
    formDataToSend.append('skills', '');
    formDataToSend.append('resume_text', '');
    formDataToSend.append('preferred_locations', JSON.stringify([]));
    formDataToSend.append('preferred_salary_ranges', JSON.stringify([]));
    formDataToSend.append('preferred_job_types', JSON.stringify(['Full-time']));
    formDataToSend.append('preferred_work_arrangements', JSON.stringify(['No Preference']));
  };

  const buildUserData = (options: { isOAuth?: boolean; isEmailVerified?: boolean; isNewUser?: boolean; resumeSkipped?: boolean } = {}): any => {
    const baseData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      jobTitle: formData.jobTitle,
      experience: formData.experience,
      location: formData.location,
      bio: formData.bio,
      skills: formData.skills,
      resumeText: formData.resumeText,
      resumeFile: formData.resumeFile,
      preferredLocations: formData.preferredLocations,
      preferredSalaryRanges: formData.preferredSalaryRanges,
      preferredJobTypes: formData.preferredJobTypes,
      preferredWorkArrangements: formData.preferredWorkArrangements,
      company: formData.company,
      companySize: formData.companySize,
      industry: formData.industry,
      department: formData.department,
      website: formData.website,
      institution: formData.institution,
    };

    if (options.isOAuth) {
      return {
        ...oauthUserData,
        ...baseData,
        profileComplete: true,
        isOAuthUser: true,
      };
    }

    if (options.isEmailVerified) {
      return {
        ...oauthUserData,
        ...baseData,
        profileComplete: true,
        isEmailVerified: true,
      };
    }

    return {
      ...baseData,
      role: userRole,
      profileComplete: !options.resumeSkipped,
      isNewUser: options.isNewUser ?? true,
      resumeSkipped: options.resumeSkipped,
    };
  };

  return {
    step,
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    isLoading,
    signUpError,
    accountCreated,
    passwordCheck,
    setStep,
    setErrors,
    setSignUpError,
    setIsLoading,
    setAccountCreated,
    handleChange,
    handleTogglePassword,
    handleToggleConfirmPassword,
    validateAndProceedAccount,
    validateAndProceedProfile,
    createAccount,
    buildUserData,
    resetError,
  };
}
