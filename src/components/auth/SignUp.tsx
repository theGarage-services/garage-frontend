import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { authService } from '@/api/auth';
import { verificationService } from '@/api/verifications';
import { useSignUp } from '@/hooks/auth/useSignUp';
import { AccountStep, ProfileStep, ResumeStep, InstitutionStepWrapper, PreferencesSetup, IndividualJobPreferences } from './signup-steps';
import { SignUpProps, FormFieldValue } from '@/types/auth/signup';
import { useNavigate } from 'react-router-dom';

export function SignUp({
  onSignUp,
  onSwitchToLogin,
  onBack,
  userRole,
  isOAuthUser = false,
  oauthUserData,
  isEmailVerified = false,
}: Readonly<SignUpProps>) {
  const navigate = useNavigate();
  const {
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
    setSignUpError,
    setIsLoading,
    handleChange,
    handleTogglePassword,
    handleToggleConfirmPassword,
    validateAndProceedAccount,
    validateAndProceedProfile,
    createAccount,
    buildUserData,
  } = useSignUp({ userRole, isOAuthUser, isEmailVerified, oauthUserData });

  const handleNext = () => {
    if (step === 'account' && validateAndProceedAccount()) {
      if (accountCreated) {
        setStep(userRole === 'recruiter' ? 'profile' : 'resume');
      } else {
        void createAccount();
      }
    } else if (step === 'resume' && userRole === 'job-seeker') {
      // Resume is mandatory, proceed to profile
      setStep('profile');
    } else if (step === 'profile' && validateAndProceedProfile()) {
      setStep(userRole === 'recruiter' ? 'institution' : 'preferences');
    }
  };

  const handleBack = () => {
    // OAuth users skip account creation; back from their first visible step
    // returns them to role selection instead of a non-existent account step.
    if (isOAuthUser && (step === 'resume' || step === 'profile')) {
      onBack?.();
      return;
    }

    const backSteps: Record<string, string> = {
      resume: 'account',
      profile: 'resume',
      preferences: 'profile',
      institution: 'profile',
    };
    const prevStep = backSteps[step];
    if (prevStep) {
      setStep(prevStep as typeof step);
    }
  };

  const resolveWorkHistoryIndex = (
    workHistory: Array<{ title?: string; role?: string; position?: string }>,
    jobTitle: string
  ): number => {
    if (!workHistory?.length) return 0;
    const normalizedJobTitle = jobTitle.toLowerCase().trim();
    const matchIndex = workHistory.findIndex((item) =>
      (item.title || item.role || item.position || '').toLowerCase().trim().includes(normalizedJobTitle)
    );
    return matchIndex === -1 ? 0 : matchIndex;
  };

  const buildProfilePayload = (preferences?: IndividualJobPreferences) => ({
    email: formData.email,
    job_title: formData.jobTitle,
    exp_level: formData.experience,
    address: formData.location,  // Map location to backend address field
    phone: formData.phone,
    bio: formData.bio,
    skills: formData.skills,
    // Individual preference fields (use passed preferences or fall back to formData)
    preferred_locations: preferences?.preferredLocations ?? formData.preferredLocations,
    preferred_salary_ranges: preferences?.preferredSalaryRanges ?? formData.preferredSalaryRanges,
    preferred_job_types: preferences?.preferredJobTypes ?? formData.preferredJobTypes,
    preferred_work_arrangements: preferences?.preferredWorkArrangements ?? formData.preferredWorkArrangements,
    // Company fields - use backend field name directly
    current_company: formData.company,
    company_size: formData.companySize,
    // Industry for both candidates and recruiters
    industry: formData.industry,
    // Use explicit recruiter field names for uniformity with backend
    recruiter_industry: formData.industry,
    department: formData.department,
    // Social links and professional info
    linkedin: formData.linkedin,
    github: formData.github,
    portfolio: formData.portfolio,
    website: formData.website,
    institution: formData.institution,
    recruiter_bio: formData.bio,
    profile_image: formData.profileImage,
    // Education and work history from parsed resume
    education: formData.education,
    work_history: formData.work_history,
    // Mark profile as complete now that the signup flow is finished
    profile_complete: true,
    // Note: resume_file should be handled separately as File upload
    // resume_text is not stored in backend - parsed data goes to education/work_history
  });

  const submitUserProfile = async (preferences?: IndividualJobPreferences) => {
    // Resume file is parsed in ResumeStep for preview/editing; pass it to the
    // backend profile completion endpoint so it can be saved and re-parsed to
    // populate any remaining empty candidate fields. This applies to both OAuth
    // and email/password job-seeker flows.
    const response = await authService.updateOAuthProfile(
      buildProfilePayload(preferences),
      userRole,
      formData.resumeFile ?? undefined
    );
    return response;
  };

  const handleSubmit = async (preferences?: IndividualJobPreferences) => {
    console.log('[SignUp] handleSubmit called');
    setIsLoading(true);
    setSignUpError('');

    try {
      console.log('[SignUp] Calling submitUserProfile...');
      const response = await submitUserProfile(preferences);
      console.log('[SignUp] submitUserProfile completed successfully');

      // Backend sets JWT tokens as httpOnly cookies during profile completion.

      // For job-seekers, automatically initiate a reference check now that the
      // candidate profile has been created. Any failure here is non-blocking.
      if (userRole === 'job-seeker' && response.candidate_profile_id && response.work_history?.length) {
        const workHistory = response.work_history as Array<{ title?: string; role?: string; position?: string }>;
        const workHistoryIndex = resolveWorkHistoryIndex(workHistory, formData.jobTitle);
        try {
          await verificationService.createRequest({
            candidate_id: response.candidate_profile_id,
            work_history_index: workHistoryIndex,
            check_category: 'reference',
            min_reference: 3,
            role: formData.jobTitle,
            notes: 'Reference check initiated automatically after candidate profile creation.',
          });
          console.log('[SignUp] Reference check request created successfully');
        } catch (verificationError: any) {
          console.error('[SignUp] Failed to initiate reference check:', verificationError);
        }
      }

      const userData = isOAuthUser
        ? buildUserData({ isOAuth: true })
        : isEmailVerified
          ? buildUserData({ isEmailVerified: true })
          : buildUserData({ isNewUser: true });
      console.log('[SignUp] Calling onSignUp with userData:', userData, 'role:', userRole);
      onSignUp(userData, userRole);
      console.log('[SignUp] onSignUp called');
    } catch (error: any) {
      console.error('[SignUp] handleSubmit error:', error);
      setSignUpError(error.message || 'An error occurred during sign up. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('[SignUp] handleSubmit finished, isLoading set to false');
    }
  };

  const handlePreferencesComplete = async (preferences: IndividualJobPreferences) => {
    // Update form state for UI consistency
    handleChange('preferredLocations', preferences.preferredLocations);
    handleChange('preferredSalaryRanges', preferences.preferredSalaryRanges);
    handleChange('preferredJobTypes', preferences.preferredJobTypes);
    handleChange('preferredWorkArrangements', preferences.preferredWorkArrangements);
    console.log('[SignUp] Calling handleSubmit with preferences...');
    // Pass preferences directly to handleSubmit to avoid async state delay
    await handleSubmit(preferences);
    console.log('[SignUp] handleSubmit completed');
  };


  const handleResumeNext = (parsedData?: Record<string, unknown>) => {
    if (!parsedData) {
      setStep('profile');
      return;
    }
    const fieldsToUpdate = [
      ['jobTitle', parsedData.jobTitle],
      ['company', parsedData.company],
      ['experience', parsedData.experience],
      ['location', parsedData.location],
      ['phone', parsedData.phone],
      ['bio', parsedData.bio],
      ['skills', parsedData.skills],
      ['education', parsedData.education],
      ['work_history', parsedData.work_history]
    ] as const;
    for (const [field, value] of fieldsToUpdate) {
      if (value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        handleChange(field, value as FormFieldValue);
      }
    }
    setStep('profile');
  };

  const handleSocialAuth = async (_provider: string, userData: any) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSignUp({
        ...userData,
        profileComplete: false,
        isNewUser: userRole === 'job-seeker',
      }, userRole);
    } catch (error) {
      console.error('Sign up error:', error);
      setSignUpError('Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Render preferences as standalone screen
  if (step === 'preferences' && userRole === 'job-seeker') {
    return (
      <PreferencesSetup
        userName={formData.firstName}
        onComplete={handlePreferencesComplete}
        onBack={handleBack}
        error={signUpError}
        isLoading={isLoading}
      />
    );
  }

  const isStepComplete = (targetStep: string) => {
    const stepOrder = ['account', 'resume', 'profile', 'preferences', 'institution'];
    const currentIndex = stepOrder.indexOf(step);
    const targetIndex = stepOrder.indexOf(targetStep);
    return currentIndex > targetIndex;
  };

  const renderProgressIndicator = (targetStep: string, label: string) => (
    <>
      {targetStep !== 'account' && (
        <div className={`w-16 h-0.5 ${isStepComplete(targetStep) ? 'bg-green-500' : 'bg-gray-300'}`} />
      )}
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
        step === targetStep ? 'bg-[#ff6b35] border-[#ff6b35] text-white' :
        isStepComplete(targetStep) ? 'bg-green-500 border-green-500 text-white' :
        'border-gray-300 text-gray-300'
      }`}>
        {isStepComplete(targetStep) ? <CheckCircle className="w-4 h-4" /> : label}
      </div>
    </>
  );

  const renderJobSeekerSteps = () => (
    <>
      {renderProgressIndicator('account', '1')}
      {renderProgressIndicator('resume', '2')}
      {renderProgressIndicator('profile', '3')}
      {renderProgressIndicator('preferences', '4')}
    </>
  );

  const renderRecruiterSteps = () => (
    <>
      {renderProgressIndicator('account', '1')}
      {renderProgressIndicator('profile', '2')}
      {renderProgressIndicator('institution', '3')}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[95vw] sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && step === 'account' && (
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
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <button
              className="text-3xl font-medium cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
              onClick={() => navigate('/home')}
            >
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </button>
          </div>
          <h2 className="text-xl text-gray-700 mb-2">
            Create your {userRole === 'recruiter' ? 'recruiter' : 'job seeker'} account
          </h2>
          <p className="text-gray-500">
            Join theGarage and {userRole === 'recruiter' ? 'find top talent' : 'accelerate your career'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {userRole === 'job-seeker' ? renderJobSeekerSteps() : renderRecruiterSteps()}
          </div>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {step === 'account' && (
            <AccountStep
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              passwordCheck={passwordCheck}
              onChange={handleChange}
              onTogglePassword={handleTogglePassword}
              onToggleConfirmPassword={handleToggleConfirmPassword}
              onSocialAuth={handleSocialAuth}
              onSwitchToLogin={onSwitchToLogin}
              onContinue={handleNext}
              userRole={userRole}
            />
          )}

          {step === 'profile' && (
            <ProfileStep
              formData={formData}
              errors={errors}
              userRole={userRole}
              onChange={handleChange}
              onBack={handleBack}
              onContinue={handleNext}
            />
          )}

          {step === 'resume' && userRole === 'job-seeker' && (
            <ResumeStep
              formData={formData}
              errors={errors}
              userRole={userRole}
              onChange={handleChange}
              onError={setSignUpError}
              onBack={handleBack}
              onNext={handleResumeNext}
              isMandatory={true}
            />
          )}

          {step === 'institution' && userRole === 'recruiter' && (
            <InstitutionStepWrapper
              formData={formData}
              onInstitutionCreated={(institutionData) => {
                handleChange('institution', institutionData);
                void handleSubmit();
              }}
              onBack={handleBack}
            />
          )}

          {/* Alert and Navigation - Only show for steps that need it */}
          {step !== 'institution' && step !== 'preferences' && step !== 'resume' && (
            <>
              {signUpError && (
                <Alert className={`${signUpError.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {signUpError.includes('successfully') ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={signUpError.includes('successfully') ? 'text-green-700' : 'text-red-700'}>
                    {signUpError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between pt-6">
                <div>
                  {step === 'account' ? (
                    <Button variant="ghost" onClick={onSwitchToLogin} className="px-6">
                      Sign In Instead
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleBack} className="px-6">
                      Back
                    </Button>
                  )}
                </div>

                <div>
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        {step === 'account' ? 'Creating Account...' : 'Processing...'}
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}