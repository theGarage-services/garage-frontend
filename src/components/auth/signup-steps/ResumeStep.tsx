import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X, AlertCircle, Loader2 } from 'lucide-react';
import { ResumeStepProps } from '@/types/auth/signup';
import { parseResume, mapParsedDataToFormFields, ParsedResumeData } from '@/api/resumeParser';

export function ResumeStep({
  formData,
  errors,
  onChange,
  onError,
  onNext,
  onBack,
  isMandatory = true,
}: Readonly<ResumeStepProps>) {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept PDF files
    if (file.type !== 'application/pdf') {
      onChange('resumeFile', null);
      // We need to signal error - but onChange doesn't handle errors
      // So we'll use a different approach
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onChange('resumeFile', null);
      return;
    }

    onChange('resumeFile', file);
  };

  const handleRemoveFile = () => {
    onChange('resumeFile', null);
    onChange('resumeText', '');
  };

  const handleContinue = async () => {
    if (!formData.resumeFile) {
      onError('Please upload your resume to continue');
      return;
    }
    
    // If we already parsed the resume, just proceed with the parsed data
    if (parsedData) {
      const mappedFields = mapParsedDataToFormFields(parsedData);
      onNext(mappedFields as unknown as Record<string, string>);
      return;
    }
    
    setIsParsing(true);
    try {
      // Call the resume parser API
      const result = await parseResume(formData.resumeFile, 0.5);
      
      if (result.success && result.parsed_data) {
        setParsedData(result.parsed_data);
        const mappedFields = mapParsedDataToFormFields(result.parsed_data);
        onNext(mappedFields as unknown as Record<string, string>);
      } else {
        onError('Failed to parse resume. Please try again or continue manually.');
      }
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      onError(error.message || 'Failed to parse resume. You can still continue manually.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Resume</h3>
        <p className="text-gray-500">Upload your resume to auto-fill your profile and get better job matches</p>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#ff6b35] transition-colors">
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="resume" className="cursor-pointer" aria-label="Upload resume">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Click to upload resume</p>
                <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
              </div>
            </div>
          </label>
        </div>

        {errors.resumeFile && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.resumeFile}
          </div>
        )}

        {/* Uploaded File */}
        {formData.resumeFile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <File className="w-5 h-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-green-800">{formData.resumeFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="self-start sm:self-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 mt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onBack} className="px-6 w-full sm:w-auto">
            Back to Account
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isParsing || !formData.resumeFile}
            className="px-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white w-full sm:w-auto"
          >
            {isParsing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </div>
            ) : (
              'Continue to Profile'
            )}
          </Button>
        </div>

        {/* Mandatory Notice */}
        {isMandatory && !formData.resumeFile && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              <span className="text-[#ff6b35]">*</span> Resume upload is required to complete registration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
