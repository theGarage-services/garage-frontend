import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ArrowLeft, Download, Loader2, Bookmark } from 'lucide-react';
import { FlagFraudDialog } from '../../common/FlagFraudDialog';
import { getStatusColor, getStageDisplayName } from './utils';

export interface CandidateProfileHeaderProps {
  onBack: () => void;
  candidate: any;
  isDownloadingResume: boolean;
  handleDownloadResume: () => void;
  isTogglingSave: boolean;
  isSaved: boolean;
  saveButtonLabel: string;
  handleToggleSave: () => void;
  onFlagFraud: (reason: string) => void | Promise<void>;
}

export function CandidateProfileHeader({
  onBack,
  candidate,
  isDownloadingResume,
  handleDownloadResume,
  isTogglingSave,
  isSaved,
  saveButtonLabel,
  handleToggleSave,
  onFlagFraud
}: Readonly<CandidateProfileHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-[#ff6b35] self-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>
        <div className="h-6 w-px bg-gray-300 hidden sm:block" />
        <div>
          <h1 className="text-2xl text-gray-900">{candidate.name}</h1>
          <p className="text-gray-600">{candidate.title} at {candidate.currentCompany}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge className={getStatusColor(candidate.applicationStatus)}>
          {getStageDisplayName(candidate.applicationStatus)}
        </Badge>
        <Button
          variant="outline"
          onClick={handleDownloadResume}
          disabled={isDownloadingResume}
          className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white disabled:opacity-60"
        >
          {isDownloadingResume ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isDownloadingResume ? 'Downloading...' : 'Resume'}
        </Button>
        <Button
          variant="outline"
          onClick={handleToggleSave}
          disabled={isTogglingSave}
          className={`disabled:opacity-60 ${
            isSaved
              ? 'bg-green-100 text-green-600 border-green-600 hover:bg-green-200'
              : 'border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          {isTogglingSave ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bookmark className="w-4 h-4 mr-2" />
          )}
          {saveButtonLabel}
        </Button>
        <FlagFraudDialog
          title="Flag candidate as fraudulent"
          description="This will report this candidate profile for fraud. If flagged 3 times, the account will be suspended."
          onConfirm={onFlagFraud}
          buttonSize="sm"
          buttonVariant="outline"
          buttonText="Flag"
          className="border-red-300 text-red-600 hover:bg-red-50"
        />
      </div>
    </div>
  );
}
