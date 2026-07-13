import { useState } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { AlertCircle, Upload, File, X } from 'lucide-react';
import { DepartmentSelect } from '../../common/DepartmentSelect';

interface FormData {
  recruiterTitle: string;
  department: string;
  verificationDocument: File | null;
  taxId: string;
  isAuthorized: boolean;
}

interface VerificationStepProps {
  formData: FormData;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: string | boolean | File | null) => void;
}

function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-red-600 text-sm">
      <AlertCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

export function VerificationStep({ formData, errors, onChange }: Readonly<VerificationStepProps>) {
  const [fileError, setFileError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB');
      return;
    }

    onChange('verificationDocument', file);
    setFileError('');
  };

  const handleRemoveFile = () => {
    onChange('verificationDocument', null);
    setFileError('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Verification & Role</h3>
        <p className="text-gray-500">Confirm your authority and role within the organization</p>
      </div>

      {/* Recruiter Title */}
      <div className="space-y-2">
        <Label htmlFor="recruiterTitle">Your Job Title</Label>
        <Input
          id="recruiterTitle"
          placeholder="e.g. HR Manager, Talent Acquisition Specialist"
          value={formData.recruiterTitle}
          onChange={(e) => onChange('recruiterTitle', e.target.value)}
          className={`h-12 border-2 ${errors.recruiterTitle ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.recruiterTitle} />
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <DepartmentSelect
          value={formData.department}
          onValueChange={(value: string) => onChange('department', value)}
          triggerClassName={`h-12 border-2 ${errors.department ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.department} />
      </div>

      {/* Verification Document Upload */}
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
          <label
            htmlFor="verification"
            className="cursor-pointer flex flex-col items-center gap-3"
            aria-label="Upload business license or registration (PDF, JPG, or PNG max 10MB)"
          >
            <span className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </span>
            <span className="font-medium text-gray-900">Upload business license or registration</span>
            <span className="text-sm text-gray-500">PDF, JPG, or PNG (max 10MB)</span>
          </label>
        </div>

        {fileError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {fileError}
          </div>
        )}

        {formData.verificationDocument && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <File className="w-5 h-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-green-800 truncate">{formData.verificationDocument.name}</p>
                  <p className="text-sm text-green-600">
                    {(formData.verificationDocument.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="self-start sm:self-auto">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tax ID */}
      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
        <Input
          id="taxId"
          placeholder="e.g. 12-3456789"
          value={formData.taxId}
          onChange={(e) => onChange('taxId', e.target.value)}
          className="h-12 border-2 border-gray-200"
        />
        <p className="text-sm text-gray-500">This helps verify your organization&apos;s legitimacy</p>
      </div>

      {/* Authorization Confirmation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="authorized"
            checked={formData.isAuthorized}
            onChange={(e) => onChange('isAuthorized', e.target.checked)}
            className="mt-1"
          />
          <div>
            <Label htmlFor="authorized" className="text-amber-800 cursor-pointer">
              I confirm that I am authorized to register this organization on theGarage and create recruiting accounts on behalf of this institution.
            </Label>
            <FieldError message={errors.isAuthorized} />
          </div>
        </div>
      </div>
    </div>
  );
}
