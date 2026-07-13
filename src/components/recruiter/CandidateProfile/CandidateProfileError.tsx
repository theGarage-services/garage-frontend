import { Button } from '../../ui/button';
import { User, ArrowLeft } from 'lucide-react';

export function CandidateProfileError({ onBack, errorMessage }: Readonly<{ onBack: () => void; errorMessage: string | null }>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-[#ff6b35]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>
        </div>
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl text-gray-900 mb-2">Unable to load candidate profile</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage || 'Please navigate from the candidate list or try again later.'}
          </p>
          {errorMessage && (
            <Button onClick={() => globalThis.location.reload()} className="bg-[#ff6b35] text-white">
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
