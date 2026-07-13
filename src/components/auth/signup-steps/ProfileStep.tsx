import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndustrySelect } from '@/components/common/IndustrySelect';
import { DepartmentSelect } from '@/components/common/DepartmentSelect';
import { AlertCircle } from 'lucide-react';
import { ProfileStepProps } from '@/types/auth/signup';

export function ProfileStep({
  formData,
  errors,
  userRole,
  onChange,
}: Readonly<ProfileStepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
        <p className="text-gray-500">
          {userRole === 'recruiter'
            ? 'Tell us about your recruiting role'
            : 'Tell us about your professional background'}
        </p>
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle">
          {userRole === 'recruiter' ? 'Your Job Title' : 'Current Job Title'}
        </Label>
        <Input
          id="jobTitle"
          placeholder={userRole === 'recruiter'
            ? "e.g. Talent Acquisition Manager, HR Director"
            : "e.g. Senior Data Analyst"}
          value={formData.jobTitle}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          className={`h-12 border-2 ${errors.jobTitle ? 'border-red-300' : 'border-gray-200'}`}
        />
        {errors.jobTitle && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.jobTitle}
          </div>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">
          {userRole === 'recruiter' ? 'Current Organization' : 'Current Company (Optional)'}
        </Label>
        <Input
          id="company"
          placeholder="e.g. Google, Microsoft"
          value={formData.company}
          onChange={(e) => onChange('company', e.target.value)}
          className="h-12 border-2 border-gray-200"
        />
      </div>

      {/* Experience Level - Only for job seekers */}
      {userRole === 'job-seeker' && (
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={formData.experience} onValueChange={(value) => onChange('experience', value)}>
            <SelectTrigger className={`h-12 border-2 ${errors.experience ? 'border-red-300' : 'border-gray-200'} bg-white`}>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
              <SelectItem value="L1">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="L2">Associate Level (2-4 years)</SelectItem>
              <SelectItem value="L3">Professional Level (4-7 years)</SelectItem>
              <SelectItem value="L4">Senior Level (7-10 years)</SelectItem>
              <SelectItem value="L5">Principal Level (10+ years)</SelectItem>
            </SelectContent>
          </Select>
          {errors.experience && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.experience}
            </div>
          )}
        </div>
      )}

      {/* Department - Only for recruiters */}
      {userRole === 'recruiter' && (
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <DepartmentSelect
            value={formData.department}
            onValueChange={(value) => onChange('department', value)}
            triggerClassName="h-12 border-2 border-gray-200"
          />
        </div>
      )}

      {/* Industry - Available for both job seekers and recruiters */}
      <div className="space-y-2">
        <Label>Industry</Label>
        <IndustrySelect
          value={formData.industry}
          onValueChange={(value) => onChange('industry', value)}
          triggerClassName="h-12 border-2 border-gray-200"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. San Francisco, CA"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
          className={`h-12 border-2 ${errors.location ? 'border-red-300' : 'border-gray-200'}`}
        />
        {errors.location && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.location}
          </div>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="e.g. +1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="h-12 border-2 border-gray-200"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder={userRole === 'recruiter'
            ? "Brief description of your recruiting experience and approach..."
            : "Brief description of your professional background and career goals..."}
          value={formData.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          className="border-2 border-gray-200 min-h-[100px]"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500">
          {formData.bio.length}/500 characters
        </div>
      </div>

      {/* Skills - Only for job seekers */}
      {userRole === 'job-seeker' && (
        <div className="space-y-2">
          <Label htmlFor="skills">Key Skills (Optional)</Label>
          <Input
            id="skills"
            placeholder="e.g. Python, SQL, Tableau, Machine Learning"
            value={formData.skills}
            onChange={(e) => onChange('skills', e.target.value)}
            className="h-12 border-2 border-gray-200"
          />
          <p className="text-sm text-gray-500">Separate skills with commas</p>
        </div>
      )}

      {/* Social Links & Professional Info - Only for job seekers */}
      {userRole === 'job-seeker' && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900">Social Links & Professional Info (Optional)</h4>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) => onChange('linkedin', e.target.value)}
              className="h-12 border-2 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              type="url"
              placeholder="https://github.com/yourusername"
              value={formData.github}
              onChange={(e) => onChange('github', e.target.value)}
              className="h-12 border-2 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <Input
              id="portfolio"
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolio}
              onChange={(e) => onChange('portfolio', e.target.value)}
              className="h-12 border-2 border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
