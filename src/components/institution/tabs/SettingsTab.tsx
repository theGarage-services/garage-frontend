import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface InstitutionSettings {
  allowTeamInvites?: boolean;
  requireApproval?: boolean;
  jobPostingLimit?: number;
}

interface SettingsTabProps {
  settings?: InstitutionSettings;
}

export function SettingsTab({ settings }: Readonly<SettingsTabProps>) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Institution Settings</h2>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Team Invitations</h3>
            <p className="text-sm text-gray-500">Allow team members to invite new recruiters</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            {settings?.allowTeamInvites ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Approval Required</h3>
            <p className="text-sm text-gray-500">Require admin approval for new team members</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            {settings?.requireApproval ? 'Required' : 'Not Required'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Job Posting Limit</h3>
            <p className="text-sm text-gray-500">Maximum number of active job postings</p>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto">
            {settings?.jobPostingLimit || 50} Jobs
          </Button>
        </div>
      </div>
    </Card>
  );
}
