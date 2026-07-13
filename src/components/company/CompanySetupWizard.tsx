import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { 
  Building2, 
  Upload, 
  FileText, 
  Palette, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  X,
  File,
  Image,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CompanySetupWizardProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
  initialData?: any;
}

export function CompanySetupWizard({ onComplete, onSkip, initialData }: Readonly<CompanySetupWizardProps>) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    companyName: initialData?.companyName || '',
    industry: initialData?.industry || '',
    companySize: initialData?.companySize || '',
    website: initialData?.website || '',
    description: initialData?.description || '',
    
    // Step 2: Legal & Compliance
    legalName: initialData?.legalName || '',
    taxId: initialData?.taxId || '',
    incorporationDocs: [] as File[],
    complianceDocs: [] as File[],
    
    // Step 3: Culture & Values
    mission: initialData?.mission || '',
    vision: initialData?.vision || '',
    values: initialData?.values || '',
    culture: initialData?.culture || '',
    
    // Step 4: Branding
    logo: null as File | null,
    primaryColor: initialData?.primaryColor || '#ff6b35',
    secondaryColor: initialData?.secondaryColor || '#ff8c42',
    emailSignature: initialData?.emailSignature || '',
    
    // Step 5: Templates & Policies
    offerLetterTemplate: null as File | null,
    employeeHandbook: null as File | null,
    policyDocs: [] as File[],
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const steps = [
    { id: 1, title: 'Company Info', icon: Building2 },
    { id: 2, title: 'Legal & Compliance', icon: FileText },
    { id: 3, title: 'Culture & Values', icon: Users },
    { id: 4, title: 'Branding', icon: Palette },
    { id: 5, title: 'Templates & Policies', icon: File },
  ];

  // Validation rules for each step
  const stepValidationRules = {
    1: [
      { field: 'companyName', message: 'Company name is required' },
      { field: 'industry', message: 'Industry is required' },
      { field: 'companySize', message: 'Company size is required' },
      { field: 'website', message: 'Website is required' }
    ],
    2: [
      { field: 'legalName', message: 'Legal name is required' },
      { field: 'taxId', message: 'Tax ID is required' }
    ],
    3: [
      { field: 'mission', message: 'Mission statement is required' }
    ]
  };

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};
    const rules = stepValidationRules[currentStep as keyof typeof stepValidationRules] || [];
    
    rules.forEach(rule => {
      if (!formData[rule.field as keyof typeof formData]) {
        newErrors[rule.field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      ...formData,
      setupComplete: true,
      completedAt: new Date().toISOString(),
    });
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (files && files.length > 0) {
      if (field === 'incorporationDocs' || field === 'complianceDocs' || field === 'policyDocs') {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field as keyof typeof prev] as File[], ...Array.from(files)]
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: files[0] }));
      }
    }
  };

  const removeFile = (field: string, index?: number) => {
    if (index === undefined) {
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as File[]).filter((_, i) => i !== index)
      }));
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">
            <span className="text-gray-900">the</span>
            <span className="text-[#ff6b35]">Garage</span>
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">Company Setup</h2>
          <p className="text-gray-600">Let's get your organization set up on theGarage</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of {steps.length}</span>
              <span className="text-sm font-medium text-[#ff6b35]">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isComplete 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                        ? 'bg-[#ff6b35] text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'text-[#ff6b35] font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-12 mx-2 mb-8 ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Company Information</h3>
                <p className="text-gray-600 mb-6">Tell us about your organization</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Corporation"
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Technology, Healthcare, etc."
                      className={errors.industry ? 'border-red-500' : ''}
                    />
                    {errors.industry && (
                      <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companySize">Company Size *</Label>
                    <select
                      id="companySize"
                      value={formData.companySize}
                      onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                      className={`w-full h-10 px-3 rounded-md border ${errors.companySize ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ff6b35]`}
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </select>
                    {errors.companySize && (
                      <p className="text-sm text-red-500 mt-1">{errors.companySize}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Company Website *</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://acmecorp.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500 mt-1">{errors.website}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your company..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Legal & Compliance */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Legal & Compliance</h3>
                <p className="text-gray-600 mb-6">Legal documentation and compliance information</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legalName">Legal Company Name *</Label>
                    <Input
                      id="legalName"
                      value={formData.legalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                      placeholder="Acme Corporation, Inc."
                      className={errors.legalName ? 'border-red-500' : ''}
                    />
                    {errors.legalName && (
                      <p className="text-sm text-red-500 mt-1">{errors.legalName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="taxId">Tax ID / EIN *</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="XX-XXXXXXX"
                      className={errors.taxId ? 'border-red-500' : ''}
                    />
                    {errors.taxId && (
                      <p className="text-sm text-red-500 mt-1">{errors.taxId}</p>
                    )}
                  </div>
                </div>

                {/* Incorporation Documents */}
                <div>
                  <Label>Incorporation Documents</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload Articles of Incorporation, Certificate of Formation, etc.</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('incorporationDocs', e.target.files)}
                      className="hidden"
                      id="incorporationDocs"
                    />
                    <label htmlFor="incorporationDocs">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose Files</span>
                      </Button>
                    </label>
                  </div>
                  {formData.incorporationDocs.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.incorporationDocs.map((file, index) => (
                        <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile('incorporationDocs', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compliance Documents */}
                <div>
                  <Label>Compliance Certifications (Optional)</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">ISO certifications, GDPR compliance, etc.</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('complianceDocs', e.target.files)}
                      className="hidden"
                      id="complianceDocs"
                    />
                    <label htmlFor="complianceDocs">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose Files</span>
                      </Button>
                    </label>
                  </div>
                  {formData.complianceDocs.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.complianceDocs.map((file, index) => (
                        <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile('complianceDocs', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Culture & Values */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Culture & Values</h3>
                <p className="text-gray-600 mb-6">Define your company's mission, vision, and values</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="mission">Mission Statement *</Label>
                  <Textarea
                    id="mission"
                    value={formData.mission}
                    onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                    placeholder="What is your company's core purpose?"
                    rows={3}
                    className={errors.mission ? 'border-red-500' : ''}
                  />
                  {errors.mission && (
                    <p className="text-sm text-red-500 mt-1">{errors.mission}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vision">Vision Statement</Label>
                  <Textarea
                    id="vision"
                    value={formData.vision}
                    onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                    placeholder="Where do you see your company in the future?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="values">Core Values</Label>
                  <Textarea
                    id="values"
                    value={formData.values}
                    onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
                    placeholder="List your company's core values (one per line)"
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">Example: Integrity, Innovation, Collaboration</p>
                </div>

                <div>
                  <Label htmlFor="culture">Company Culture</Label>
                  <Textarea
                    id="culture"
                    value={formData.culture}
                    onChange={(e) => setFormData(prev => ({ ...prev, culture: e.target.value }))}
                    placeholder="Describe your company culture and work environment"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Branding */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Branding</h3>
                <p className="text-gray-600 mb-6">Customize your company's visual identity</p>
              </div>

              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    {formData.logo ? (
                      <div className="space-y-4">
                        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="w-16 h-16 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-700">{formData.logo.name}</span>
                          <button
                            onClick={() => removeFile('logo')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload your company logo (PNG, JPG, SVG)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('logo', e.target.files)}
                          className="hidden"
                          id="logo"
                        />
                        <label htmlFor="logo">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">Choose File</span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Brand Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#ff6b35"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#ff8c42"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Signature */}
                <div>
                  <Label htmlFor="emailSignature">Email Signature Template (Optional)</Label>
                  <Textarea
                    id="emailSignature"
                    value={formData.emailSignature}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailSignature: e.target.value }))}
                    placeholder="Default email signature for your team"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Templates & Policies */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">Templates & Policies</h3>
                <p className="text-gray-600 mb-6">Upload templates and company policies</p>
              </div>

              <div className="space-y-4">
                {/* Offer Letter Template */}
                <div>
                  <Label>Offer Letter Template</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    {formData.offerLetterTemplate ? (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{formData.offerLetterTemplate.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile('offerLetterTemplate')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload your offer letter template</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('offerLetterTemplate', e.target.files)}
                          className="hidden"
                          id="offerLetterTemplate"
                        />
                        <label htmlFor="offerLetterTemplate">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">Choose File</span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Employee Handbook */}
                <div>
                  <Label>Employee Handbook</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    {formData.employeeHandbook ? (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{formData.employeeHandbook.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile('employeeHandbook')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload your employee handbook</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileChange('employeeHandbook', e.target.files)}
                          className="hidden"
                          id="employeeHandbook"
                        />
                        <label htmlFor="employeeHandbook">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">Choose File</span>
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Policy Documents */}
                <div>
                  <Label>Company Policies</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload HR policies, code of conduct, etc.</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('policyDocs', e.target.files)}
                      className="hidden"
                      id="policyDocs"
                    />
                    <label htmlFor="policyDocs">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose Files</span>
                      </Button>
                    </label>
                  </div>
                  {formData.policyDocs.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.policyDocs.map((file, index) => (
                        <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile('policyDocs', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    These templates will be available to all recruiters in your organization. You can update them anytime from the Document Management Center.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onSkip && currentStep < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-600"
                >
                  Skip Setup
                </Button>
              )}
              
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
              >
                {currentStep === 5 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
