import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { FileText, Save } from 'lucide-react';
import type { JobData } from '../../../api/jobPosts';

interface Step2DescriptionProps {
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  errors: Record<string, string>;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

export function Step2Description({ jobData, setJobData, errors, onSaveDraft, isSubmitting }: Readonly<Step2DescriptionProps>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Job Details</h2>
          <p className="text-gray-600">Provide a comprehensive description of the role</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="summary" className="text-base">
            Job Summary *
          </Label>
          <Textarea
            id="summary"
            value={jobData.summary}
            onChange={(e) => setJobData((prev) => ({ ...prev, summary: e.target.value }))}
            placeholder="A brief 2-3 sentence overview of the role that will appear in search results..."
            className={`mt-2 min-h-[100px] ${errors.summary ? 'border-red-300' : ''}`}
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            {errors.summary && <p className="text-red-600 text-sm">{errors.summary}</p>}
            <p className="text-xs text-gray-500 ml-auto">{jobData.summary.length}/300</p>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-base">
            Job Description *
          </Label>
          <Textarea
            id="description"
            value={jobData.description}
            onChange={(e) => setJobData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Provide a detailed description of the role, company culture, and what makes this opportunity unique..."
            className={`mt-2 min-h-[150px] ${errors.description ? 'border-red-300' : ''}`}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <Label htmlFor="responsibilities" className="text-base">
            Key Responsibilities
          </Label>
          <Textarea
            id="responsibilities"
            value={jobData.responsibilities}
            onChange={(e) => setJobData((prev) => ({ ...prev, responsibilities: e.target.value }))}
            placeholder="• Lead software development projects&#10;• Mentor junior developers&#10;• Design scalable architectures..."
            className="mt-2 min-h-[120px]"
          />
          <p className="text-xs text-gray-500 mt-1">Use bullet points (•) or line breaks for better readability</p>
        </div>

        <div>
          <Label htmlFor="requirements" className="text-base">
            Requirements *
          </Label>
          <Textarea
            id="requirements"
            value={jobData.requirements}
            onChange={(e) => setJobData((prev) => ({ ...prev, requirements: e.target.value }))}
            placeholder="• 5+ years of software development experience&#10;• Proficiency in React and Node.js&#10;• Strong problem-solving skills..."
            className={`mt-2 min-h-[120px] ${errors.requirements ? 'border-red-300' : ''}`}
          />
          {errors.requirements && <p className="text-red-600 text-sm mt-1">{errors.requirements}</p>}
        </div>

        <div>
          <Label htmlFor="niceToHave" className="text-base">
            Nice to Have
          </Label>
          <Textarea
            id="niceToHave"
            value={jobData.niceToHave}
            onChange={(e) => setJobData((prev) => ({ ...prev, niceToHave: e.target.value }))}
            placeholder="• Experience with cloud platforms (AWS, GCP)&#10;• Previous startup experience&#10;• Open source contributions..."
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="benefits" className="text-base">
            Benefits & Perks
          </Label>
          <Textarea
            id="benefits"
            value={jobData.benefits}
            onChange={(e) => setJobData((prev) => ({ ...prev, benefits: e.target.value }))}
            placeholder="• Comprehensive health coverage&#10;• Flexible work arrangements&#10;• Professional development budget&#10;• Stock options..."
            className="mt-2 min-h-[120px]"
          />
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
