import { Card } from '../../ui/card';
import type { JobData, WorkArrangement, EmploymentType, Currency, ExperienceLevel, EducationLevel } from '../../../api/jobPosts';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { DepartmentSelect } from '../../common/DepartmentSelect';
import { IndustrySelect } from '../../common/IndustrySelect';
import {
  Briefcase,
  Sparkles,
  Lightbulb,
  X,
  Check,
  Save
} from 'lucide-react';

interface ParsedContent {
  title: string;
  department: string;
  location: string;
  workArrangement: string;
  employmentType: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  experienceLevel: string;
  educationLevel: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  benefits: string;
}

interface Step1BasicInfoProps {
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  errors: Record<string, string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadedFile: File | null;
  isParsingPDF: boolean;
  parsedContent: ParsedContent | null;
  showParsedData: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyParsedData: () => void;
  onDiscardParsedData: () => void;
  onTriggerFileInput: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

const MAX_SALARY_SPREAD = 50000;

function parseSalaryString(value: string): number | null {
  const num = Number.parseFloat(value.replaceAll(',', '').trim());
  return Number.isNaN(num) ? null : num;
}

export function Step1BasicInfo({
  jobData,
  setJobData,
  errors,
  parsedContent,
  showParsedData,
  onApplyParsedData,
  onDiscardParsedData,
  onSaveDraft,
  isSubmitting,
}: Readonly<Step1BasicInfoProps>) {
  const handleSalaryMinChange = (value: string) => {
    setJobData((prev) => {
      const next = { ...prev, salaryMin: value };
      const minNum = parseSalaryString(value);
      const maxNum = parseSalaryString(prev.salaryMax);
      if (minNum !== null && maxNum !== null && maxNum - minNum > MAX_SALARY_SPREAD) {
        next.salaryMax = String(minNum + MAX_SALARY_SPREAD);
      }
      return next;
    });
  };

  const handleSalaryMaxChange = (value: string) => {
    setJobData((prev) => {
      const next = { ...prev, salaryMax: value };
      const minNum = parseSalaryString(prev.salaryMin);
      const maxNum = parseSalaryString(value);
      if (minNum !== null && maxNum !== null && maxNum - minNum > MAX_SALARY_SPREAD) {
        next.salaryMin = String(maxNum - MAX_SALARY_SPREAD);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Basic Information</h2>
          <p className="text-gray-600">Let's start with the fundamentals of your job posting</p>
        </div>
      </div>

      {/* PDF Upload Section */}
      {/* <Card className="p-6 border-2 border-dashed border-[#ff6b35]/30 bg-orange-50/50 mb-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Job Description Parsing</h3>
          <p className="text-gray-600 mb-4">Upload a PDF job description and let our AI extract the details for you</p>

          {!uploadedFile && !isParsingPDF && (
            <div>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
              <Button
                onClick={onTriggerFileInput}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF Job Description
              </Button>
              <p className="text-xs text-gray-500 mt-2">Supports PDF files up to 10MB</p>
            </div>
          )}

          {isParsingPDF && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
              <p className="font-medium text-gray-900">AI is analyzing your job description...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          )}

          {uploadedFile && !isParsingPDF && !showParsedData && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{uploadedFile.name}</span>
              </div>
              <Button size="sm" variant="outline" onClick={onDiscardParsedData} className="text-red-600 border-red-300 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </Card> */}

      {/* Parsed Data Preview */}
      {showParsedData && parsedContent && (
        <Card className="p-6 border-[#ff6b35] bg-orange-50 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Extraction Complete</h3>
                <p className="text-sm text-gray-600">Review and edit the extracted information</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onApplyParsedData}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
              <Button variant="outline" onClick={onDiscardParsedData} className="border-red-300 text-red-600 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Discard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Title:</span> {parsedContent.title}
              </div>
              <div>
                <span className="font-medium">Department:</span> {parsedContent.department}
              </div>
              <div>
                <span className="font-medium">Location:</span> {parsedContent.location}
              </div>
              <div>
                <span className="font-medium">Salary:</span> ${parsedContent.salaryMin} - ${parsedContent.salaryMax} {parsedContent.currency}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Experience:</span> {parsedContent.experienceLevel}
              </div>
              <div>
                <span className="font-medium">Education:</span> {parsedContent.educationLevel}
              </div>
              <div>
                <span className="font-medium">Work Type:</span> {parsedContent.employmentType}
              </div>
              <div>
                <span className="font-medium">Arrangement:</span> {parsedContent.workArrangement}
              </div>
            </div>
          </div>

          <Alert className="mt-4 border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              The AI has also generated queue recommendations based on this job description. You'll see them in the next step.
            </AlertDescription>
          </Alert>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title" className="text-base">
            Job Title *
          </Label>
          <Input
            id="title"
            value={jobData.title}
            onChange={(e) => setJobData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Senior Software Engineer"
            className={`mt-2 h-12 ${errors.title ? 'border-red-300' : ''}`}
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="department" className="text-base">
            Job Posting Department *
          </Label>
          <DepartmentSelect
            value={jobData.department}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, department: value }))}
            triggerClassName={`mt-2 h-12 ${errors.department ? 'border-red-300' : ''}`}
          />
          {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
        </div>

        <div>
          <Label htmlFor="industry" className="text-base">
            Candidate Industry *
          </Label>
          <IndustrySelect
            value={jobData.industry}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, industry: value }))}
            triggerClassName={`mt-2 h-12 ${errors.industry ? 'border-red-300' : ''}`}
          />
          {errors.industry && <p className="text-red-600 text-sm mt-1">{errors.industry}</p>}
        </div>

        <div>
          <Label htmlFor="location" className="text-base">
            Location *
          </Label>
          <Input
            id="location"
            value={jobData.location}
            onChange={(e) => setJobData((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. Toronto, ON or Remote"
            className={`mt-2 h-12 ${errors.location ? 'border-red-300' : ''}`}
          />
          {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
        </div>

        <div>
          <Label htmlFor="workArrangement" className="text-base">
            Work Arrangement
          </Label>
          <Select
            value={jobData.workArrangement}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, workArrangement: value as WorkArrangement }))}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem value="remote">🏠 Remote</SelectItem>
              <SelectItem value="hybrid">🏢 Hybrid</SelectItem>
              <SelectItem value="onsite">🏢 On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="employmentType" className="text-base">
            Employment Type
          </Label>
          <Select
            value={jobData.employmentType}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, employmentType: value as EmploymentType }))}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vacancyType" className="text-base">
            Vacancy Type
          </Label>
          <Select
            value={jobData.vacancyType}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, vacancyType: value as 'current' | 'future' }))}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem value="current">Current Vacancy</SelectItem>
              <SelectItem value="future">Future Position</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label className="text-base">Salary Range *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            <div>
              <Input
                value={jobData.salaryMin}
                onChange={(e) => handleSalaryMinChange(e.target.value)}
                placeholder="80,000"
                className={`h-12 ${errors.salaryMin ? 'border-red-300' : ''}`}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum</p>
            </div>
            <div>
              <Input
                value={jobData.salaryMax}
                onChange={(e) => handleSalaryMaxChange(e.target.value)}
                placeholder="120,000"
                className={`h-12 ${errors.salaryMax ? 'border-red-300' : ''}`}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum</p>
            </div>
            <div>
              <Select
                value={jobData.currency}
                onValueChange={(value: string) => setJobData((prev) => ({ ...prev, currency: value as Currency }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Currency</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The salary range cannot exceed {MAX_SALARY_SPREAD.toLocaleString()}.
          </p>
          {(errors.salaryMin || errors.salaryMax) && (
            <p className="text-red-600 text-sm mt-1">Both minimum and maximum salary are required</p>
          )}
          {errors.salaryRange && (
            <p className="text-red-600 text-sm mt-1">{errors.salaryRange}</p>
          )}
        </div>

        <div>
          <Label htmlFor="experienceLevel" className="text-base">
            Experience Level
          </Label>
          <Select
            value={jobData.experienceLevel}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, experienceLevel: value as ExperienceLevel | '' }))}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem value="L1">L1 - Entry Level (0-2 years)</SelectItem>
              <SelectItem value="L2">L2 - Associate Level (2-4 years)</SelectItem>
              <SelectItem value="L3">L3 - Professional Level (4-7 years)</SelectItem>
              <SelectItem value="L4">L4 - Senior Level (7-10 years)</SelectItem>
              <SelectItem value="L5">L5 - Principal Level (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="educationLevel" className="text-base">
            Education Level
          </Label>
          <Select
            value={jobData.educationLevel}
            onValueChange={(value: string) => setJobData((prev) => ({ ...prev, educationLevel: value as EducationLevel | '' }))}
          >
            <SelectTrigger className="mt-2 h-12">
              <SelectValue placeholder="Select education requirement" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
              <SelectItem value="high-school">High School</SelectItem>
              <SelectItem value="associate">Associate's Degree</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="none">No formal requirement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
        <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>
    </div>
  );
}
