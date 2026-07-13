import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { IndustrySelect } from '../../common/IndustrySelect';
import { AlertCircle } from 'lucide-react';

interface FormData {
  institutionName: string;
  institutionType: string;
  industry: string;
  size: string;
  description: string;
}

interface BasicStepProps {
  formData: FormData;
  errors: Record<string, string>;
  onChange: (field: keyof FormData, value: string) => void;
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

export function BasicStep({ formData, errors, onChange }: Readonly<BasicStepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
        <p className="text-gray-500">Tell us about your organization</p>
      </div>

      {/* Institution Name */}
      <div className="space-y-2">
        <Label htmlFor="institutionName">Institution/Company Name</Label>
        <Input
          id="institutionName"
          placeholder="e.g. Tech Solutions Inc."
          value={formData.institutionName}
          onChange={(e) => onChange('institutionName', e.target.value)}
          className={`h-12 border-2 ${errors.institutionName ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.institutionName} />
      </div>

      {/* Institution Type */}
      <div className="space-y-2">
        <Label>Institution Type</Label>
        <Select
          value={formData.institutionType}
          onValueChange={(value) => onChange('institutionType', value)}
        >
          <SelectTrigger className={`h-12 border-2 ${errors.institutionType ? 'border-red-300' : 'border-gray-200'}`}>
            <SelectValue placeholder="Select institution type" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
            <SelectItem value="corporation">Corporation</SelectItem>
            <SelectItem value="startup">Startup</SelectItem>
            <SelectItem value="nonprofit">Non-profit</SelectItem>
            <SelectItem value="government">Government Agency</SelectItem>
            <SelectItem value="university">University/Education</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="consulting">Consulting Firm</SelectItem>
            <SelectItem value="agency">Recruiting Agency</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.institutionType} />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label>Industry</Label>
        <IndustrySelect
          value={formData.industry}
          onValueChange={(value: string) => onChange('industry', value)}
          triggerClassName={`h-12 border-2 ${errors.industry ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.industry} />
      </div>

      {/* Company Size */}
      <div className="space-y-2">
        <Label>Company Size</Label>
        <Select
          value={formData.size}
          onValueChange={(value) => onChange('size', value)}
        >
          <SelectTrigger className={`h-12 border-2 ${errors.size ? 'border-red-300' : 'border-gray-200'}`}>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501-1000">501-1,000 employees</SelectItem>
            <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
            <SelectItem value="5000+">5,000+ employees</SelectItem>
          </SelectContent>
        </Select>
        <FieldError message={errors.size} />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Company Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of your company and what you do..."
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="border-2 border-gray-200 min-h-[100px]"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500">
          {formData.description.length}/500 characters
        </div>
      </div>
    </div>
  );
}
