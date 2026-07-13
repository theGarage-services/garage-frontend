import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { Building2, AlertCircle, CheckCircle, Upload, File, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

// Types
type Step = 'basic' | 'details' | 'verification';
type FieldValue = string | boolean | File | null;

interface FormData {
  institutionName: string;
  institutionType: string;
  industry: string;
  size: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  website: string;
  description: string;
  foundedYear: string;
  headquarters: string;
  verificationDocument: File | null;
  taxId: string;
  registrationNumber: string;
  recruiterTitle: string;
  department: string;
  isAuthorized: boolean;
}

interface StepProps {
  formData: FormData;
  errors: {[key: string]: string};
  handleChange: (field: string, value: FieldValue) => void;
}

// Progress Indicator Component
function ProgressIndicator({ step }: Readonly<{ step: Step }>) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        <StepIndicator number={1} label="Basics" currentStep={step} targetStep="basic" completedSteps={['details', 'verification']} />
        <Connector isActive={step === 'details' || step === 'verification'} />
        <StepIndicator number={2} label="Contact" currentStep={step} targetStep="details" completedSteps={['verification']} />
        <Connector isActive={step === 'verification'} />
        <StepIndicator number={3} label="Verification" currentStep={step} targetStep="verification" completedSteps={[]} />
      </div>
    </div>
  );
}

function StepIndicator({ number, label, currentStep, targetStep, completedSteps }: Readonly<{ number: number; label: string; currentStep: Step; targetStep: Step; completedSteps: Step[] }>) {
  const isCompleted = completedSteps.includes(currentStep);
  const isActive = currentStep === targetStep;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
        isActive ? 'bg-[#ff6b35] border-[#ff6b35] text-white' : 
        isCompleted ? 'bg-green-500 border-green-500 text-white' :
        'border-gray-300 text-gray-300'
      }`}>
        {isCompleted ? <CheckCircle className="w-4 h-4" /> : number}
      </div>
      <span className="text-xs mt-1 text-gray-500">{label}</span>
    </div>
  );
}

function Connector({ isActive }: Readonly<{ isActive: boolean }>) {
  return (
    <div className={`w-12 h-0.5 mb-4 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
  );
}

// Header Component
function Header() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-medium">
          <span className="text-gray-900">the</span>
          <span className="text-[#ff6b35]">Garage</span>
        </h1>
      </div>
      <h2 className="text-xl text-gray-700 mb-2">
        Set up your institution
      </h2>
      <p className="text-gray-500">
        Register your organization to start hiring top talent
      </p>
    </div>
  );
}

// Basic Step Component
function BasicStep({ formData, errors, handleChange }: Readonly<StepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
        <p className="text-gray-500">Tell us about your organization</p>
      </div>

      <FormField
        id="institutionName"
        label="Institution/Company Name"
        placeholder="e.g. Tech Solutions Inc."
        value={formData.institutionName}
        onChange={(e) => handleChange('institutionName', e.target.value)}
        error={errors.institutionName}
      />

      <SelectField
        label="Institution Type"
        value={formData.institutionType}
        onChange={(value) => handleChange('institutionType', value)}
        error={errors.institutionType}
        placeholder="Select institution type"
        options={[
          { value: 'corporation', label: 'Corporation' },
          { value: 'startup', label: 'Startup' },
          { value: 'nonprofit', label: 'Non-profit' },
          { value: 'government', label: 'Government Agency' },
          { value: 'university', label: 'University/Education' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'consulting', label: 'Consulting Firm' },
          { value: 'agency', label: 'Recruiting Agency' },
          { value: 'other', label: 'Other' }
        ]}
      />

      <SelectField
        label="Industry"
        value={formData.industry}
        onChange={(value) => handleChange('industry', value)}
        error={errors.industry}
        placeholder="Select industry"
        options={[
          { value: 'technology', label: 'Technology' },
          { value: 'finance', label: 'Finance & Banking' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'education', label: 'Education' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'retail', label: 'Retail & E-commerce' },
          { value: 'consulting', label: 'Consulting' },
          { value: 'media', label: 'Media & Entertainment' },
          { value: 'energy', label: 'Energy & Utilities' },
          { value: 'government', label: 'Government' },
          { value: 'nonprofit', label: 'Non-profit' },
          { value: 'other', label: 'Other' }
        ]}
      />

      <SelectField
        label="Company Size"
        value={formData.size}
        onChange={(value) => handleChange('size', value)}
        error={errors.size}
        placeholder="Select company size"
        options={[
          { value: '1-10', label: '1-10 employees' },
          { value: '11-50', label: '11-50 employees' },
          { value: '51-200', label: '51-200 employees' },
          { value: '201-500', label: '201-500 employees' },
          { value: '501-1000', label: '501-1,000 employees' },
          { value: '1001-5000', label: '1,001-5,000 employees' },
          { value: '5000+', label: '5,000+ employees' }
        ]}
      />

      <TextareaField
        id="description"
        label="Company Description (Optional)"
        placeholder="Brief description of your company and what you do..."
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        maxLength={500}
        currentLength={formData.description.length}
      />
    </div>
  );
}

// Details Step Component
function DetailsStep({ formData, errors, handleChange }: Readonly<StepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-500">Where is your organization located?</p>
      </div>

      <FormField
        id="address"
        label="Address"
        placeholder="Street address"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="city"
          label="City"
          placeholder="City"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          error={errors.city}
        />

        <FormField
          id="state"
          label="State/Province"
          placeholder="State or Province"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="country"
          label="Country"
          placeholder="Country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          error={errors.country}
        />

        <FormField
          id="zipCode"
          label="ZIP/Postal Code"
          placeholder="ZIP or Postal Code"
          value={formData.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
        />
      </div>

      <FormField
        id="phone"
        label="Phone Number"
        placeholder="Main company phone number"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
      />

      <FormField
        id="website"
        label="Website (Optional)"
        placeholder="https://yourcompany.com"
        value={formData.website}
        onChange={(e) => handleChange('website', e.target.value)}
        error={errors.website}
      />

      <FormField
        id="foundedYear"
        label="Founded Year (Optional)"
        placeholder="2010"
        value={formData.foundedYear}
        onChange={(e) => handleChange('foundedYear', e.target.value)}
      />
    </div>
  );
}

// Verification Step Component
function VerificationStep({ formData, errors, handleChange, handleFileUpload, setFormData, setErrors }: StepProps & {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Verification & Role</h3>
        <p className="text-gray-500">Confirm your authority and role within the organization</p>
      </div>

      <FormField
        id="recruiterTitle"
        label="Your Job Title"
        placeholder="e.g. HR Manager, Talent Acquisition Specialist"
        value={formData.recruiterTitle}
        onChange={(e) => handleChange('recruiterTitle', e.target.value)}
        error={errors.recruiterTitle}
      />

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <DepartmentSelect
          value={formData.department}
          onValueChange={(value) => handleChange('department', value)}
          triggerClassName={`h-12 border-2 ${errors.department ? 'border-red-300' : 'border-gray-200'}`}
        />
        {errors.department && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.department}
          </div>
        )}
      </div>

      <FileUploadSection
        verificationDocument={formData.verificationDocument}
        error={errors.verificationDocument}
        handleFileUpload={handleFileUpload}
        setFormData={setFormData}
        setErrors={setErrors}
      />

      <FormField
        id="taxId"
        label="Tax ID / EIN (Optional)"
        placeholder="e.g. 12-3456789"
        value={formData.taxId}
        onChange={(e) => handleChange('taxId', e.target.value)}
      />
      <p className="text-sm text-gray-500">This helps verify your organization's legitimacy</p>

      <AuthorizationSection
        isAuthorized={formData.isAuthorized}
        error={errors.isAuthorized}
        handleChange={handleChange}
      />
    </div>
  );
}

function FileUploadSection({ verificationDocument, error, handleFileUpload, setFormData, setErrors }: Readonly<{
  verificationDocument: File | null;
  error?: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
}>) {
  return (
    <div className="space-y-4">
      <Label>Verification Document (Optional)</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
        <input
          type="file"
          id="verification"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label htmlFor="verification" className="cursor-pointer" aria-label="Upload verification document">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload business license or registration</p>
              <p className="text-sm text-gray-500">PDF, JPG, or PNG (max 10MB)</p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {verificationDocument && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <File className="w-5 h-5 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-green-800 truncate">{verificationDocument.name}</p>
                <p className="text-sm text-green-600">
                  {(verificationDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormData(prev => ({ ...prev, verificationDocument: null }));
                setErrors(prev => ({ ...prev, verificationDocument: '' }));
              }}
              className="self-start sm:self-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorizationSection({ isAuthorized, error, handleChange }: Readonly<{
  isAuthorized: boolean;
  error?: string;
  handleChange: (field: string, value: FieldValue) => void;
}>) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="authorized"
          checked={isAuthorized}
          onChange={(e) => handleChange('isAuthorized', e.target.checked)}
          className="mt-1"
        />
        <div>
          <Label htmlFor="authorized" className="text-amber-800 cursor-pointer">
            I confirm that I am authorized to register this organization on theGarage and create recruiting accounts on behalf of this institution.
          </Label>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Form Field Components
function FormField({ id, label, placeholder, value, onChange, error }: Readonly<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`h-12 border-2 ${error ? 'border-red-300' : 'border-gray-200'}`}
      />
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, error, placeholder, options }: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  options: { value: string; label: string }[];
}>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-12 border-2 ${error ? 'border-red-300' : 'border-gray-200'}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

function TextareaField({ id, label, placeholder, value, onChange, maxLength, currentLength }: Readonly<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
  currentLength: number;
}>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border-2 border-gray-200 min-h-[100px]"
        maxLength={maxLength}
      />
      <div className="text-right text-sm text-gray-500">
        {currentLength}/{maxLength} characters
      </div>
    </div>
  );
}

interface InstitutionSetupProps {
  onInstitutionCreated: (institutionData: any) => void;
  onBack: () => void;
  recruiterData: any;
}

// Custom Hooks
function useValidation(formData: FormData, setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>) {
  const validateBasicStep = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
    if (!formData.institutionType) newErrors.institutionType = 'Institution type is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.size) newErrors.size = 'Company size is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetailsStep = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.website && !isValidUrl(formData.website)) newErrors.website = 'Please enter a valid website URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVerificationStep = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.recruiterTitle.trim()) newErrors.recruiterTitle = 'Your job title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.isAuthorized) newErrors.isAuthorized = 'You must confirm you are authorized to register this institution';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { validateBasicStep, validateDetailsStep, validateVerificationStep };
}

function useStepNavigation(step: Step, setStep: React.Dispatch<React.SetStateAction<Step>>, validateBasicStep: () => boolean, validateDetailsStep: () => boolean, onBack: () => void) {
  const handleNext = () => {
    if (step === 'basic' && validateBasicStep()) setStep('details');
    else if (step === 'details' && validateDetailsStep()) setStep('verification');
  };

  const handleBack = () => {
    if (step === 'details') setStep('basic');
    else if (step === 'verification') setStep('details');
    else onBack();
  };

  return { handleNext, handleBack };
}

function useFileUpload(setFormData: React.Dispatch<React.SetStateAction<FormData>>, setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ verificationDocument: 'Please upload a PDF, JPG, or PNG file' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ verificationDocument: 'File size must be less than 10MB' });
        return;
      }
      setFormData(prev => ({ ...prev, verificationDocument: file }));
      setErrors(prev => ({ ...prev, verificationDocument: '' }));
    }
  };
}

function useSubmit(formData: FormData, recruiterData: any, validateVerificationStep: () => boolean, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, setSetupError: React.Dispatch<React.SetStateAction<string>>, onInstitutionCreated: (data: any) => void) {
  return async () => {
    if (!validateVerificationStep()) return;
    setIsLoading(true);
    setSetupError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const institutionData = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        verificationStatus: 'pending',
        adminRecruiter: { ...recruiterData, role: 'admin', title: formData.recruiterTitle, department: formData.department },
        teamMembers: [{ ...recruiterData, role: 'admin', title: formData.recruiterTitle, department: formData.department, joinedAt: new Date().toISOString() }],
        settings: { allowTeamInvites: true, requireApproval: true, jobPostingLimit: 50 }
      };
      onInstitutionCreated(institutionData);
    } catch (error) {
      console.error('Failed to create institution:', error);
      setSetupError('An error occurred while setting up your institution. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
}

function useFieldChange(setFormData: React.Dispatch<React.SetStateAction<FormData>>, setErrors: React.Dispatch<React.SetStateAction<{[key: string]: string}>>, errors: {[key: string]: string}, setupError: string, setSetupError: React.Dispatch<React.SetStateAction<string>>) {
  return (field: string, value: FieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (setupError) setSetupError('');
  };
}

function isValidUrl(url: string) {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

export function InstitutionSetup({ onInstitutionCreated, onBack, recruiterData }: Readonly<InstitutionSetupProps>) {
  const [step, setStep] = useState<Step>('basic');
  const [formData, setFormData] = useState<FormData>({
    institutionName: '',
    institutionType: '',
    industry: '',
    size: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    website: '',
    description: '',
    foundedYear: '',
    headquarters: '',
    verificationDocument: null,
    taxId: '',
    registrationNumber: '',
    recruiterTitle: '',
    department: '',
    isAuthorized: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  const { validateBasicStep, validateDetailsStep, validateVerificationStep } = useValidation(formData, setErrors);
  const { handleNext, handleBack } = useStepNavigation(step, setStep, validateBasicStep, validateDetailsStep, onBack);
  const handleFileUpload = useFileUpload(setFormData, setErrors);
  const handleSubmit = useSubmit(formData, recruiterData, validateVerificationStep, setIsLoading, setSetupError, onInstitutionCreated);
  const handleChange = useFieldChange(setFormData, setErrors, errors, setupError, setSetupError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Header />
        <ProgressIndicator step={step} />
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {step === 'basic' && <BasicStep formData={formData} errors={errors} handleChange={handleChange} />}
          {step === 'details' && <DetailsStep formData={formData} errors={errors} handleChange={handleChange} />}
          {step === 'verification' && (
            <VerificationStep 
              formData={formData} 
              errors={errors} 
              handleChange={handleChange} 
              handleFileUpload={handleFileUpload}
              setFormData={setFormData}
              setErrors={setErrors}
            />
          )}

          {setupError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {setupError}
              </AlertDescription>
            </Alert>
          )}

          <NavigationButtons 
            step={step} 
            onBack={handleBack} 
            onNext={handleNext} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />

          <JoinInstitutionLink />
        </Card>
      </div>
    </div>
  );
}

function NavigationButtons({ step, onBack, onNext, onSubmit, isLoading }: Readonly<{
  step: Step;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}>) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="px-6 hover:text-black"
      >
        Back
      </Button>

      <div className="flex gap-3">
        {step === 'verification' ? (
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f]"
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="px-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f]"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

function JoinInstitutionLink() {
  return (
    <div className="text-center pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Already part of an institution?{' '}
        <button 
          onClick={() => {
            if (globalThis.confirm('This will redirect you to join an existing institution. Continue?')) {
              alert('Join institution feature coming soon!');
            }
          }}
          className="text-[#ff6b35] hover:underline"
        >
          Join existing institution
        </button>
      </p>
    </div>
  );
}