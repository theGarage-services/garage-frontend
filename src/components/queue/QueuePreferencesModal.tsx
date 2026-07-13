import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { LocationSelector } from '../common/LocationSelector';
import { Check, ChevronDown, MapPin, DollarSign, Briefcase, Home, Info } from 'lucide-react';
import type { IndividualJobPreferences } from '../auth/signup-steps/PreferencesStep';

interface QueuePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueId: string;
  queueTitle: string;
  currentPreferences?: IndividualJobPreferences;
  onSave: (queueId: string, preferences: IndividualJobPreferences, applyToAll: boolean) => void;
}

const SALARY_OPTIONS = [
  'Under $60k',
  '$60k - $80k',
  '$80k - $100k',
  '$100k - $150k',
  '$150k - $200k',
  'Over $200k',
  'No Preference'
];

const JOB_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary',
  'No Preference'
];

const WORK_ARRANGEMENT_OPTIONS = [
  'Remote',
  'Hybrid',
  'On-site',
  'No Preference'
];

export function QueuePreferencesModal({
  isOpen,
  onClose,
  queueId,
  queueTitle,
  currentPreferences,
  onSave
}: Readonly<QueuePreferencesModalProps>) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    currentPreferences?.preferredLocations || ['No Preference']
  );
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>(
    currentPreferences?.preferredSalaryRanges || ['No Preference']
  );
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    currentPreferences?.preferredJobTypes || ['No Preference']
  );
  const [selectedWorkArrangements, setSelectedWorkArrangements] = useState<string[]>(
    currentPreferences?.preferredWorkArrangements || ['No Preference']
  );
  const [applyToAllQueues, setApplyToAllQueues] = useState(false);

  const toggleSelection = (
    item: string,
    currentSelections: string[],
    setSelections: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    // If "No Preference" is selected, clear all other selections
    if (item === 'No Preference') {
      setSelections(['No Preference']);
      return;
    }

    // If selecting a specific option, remove "No Preference"
    const filteredSelections = currentSelections.filter(s => s !== 'No Preference');
    
    if (filteredSelections.includes(item)) {
      const newSelections = filteredSelections.filter(s => s !== item);
      setSelections(newSelections.length === 0 ? ['No Preference'] : newSelections);
    } else {
      setSelections([...filteredSelections, item]);
    }
  };

  const handleSave = () => {
    const preferences: IndividualJobPreferences = {
      preferredLocations: selectedLocations,
      preferredSalaryRanges: selectedSalaryRanges,
      preferredJobTypes: selectedJobTypes,
      preferredWorkArrangements: selectedWorkArrangements
    };
    onSave(queueId, preferences, applyToAllQueues);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <span className="text-slate-900">Queue Preferences: </span>
            <span className="text-[#ff6b35]">{queueTitle}</span>
          </DialogTitle>
          <DialogDescription>
            Customize the job preferences for this specific queue. These preferences determine which jobs are matched to this queue.
          </DialogDescription>
        </DialogHeader>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>How queue preferences work:</strong> Set specific criteria for this queue to receive targeted job recommendations.
              </p>
              <p className="text-sm text-blue-800 mt-1">
                • Select <strong>"No Preference"</strong> to include all options in that category
              </p>
              <p className="text-sm text-blue-800">
                • Choose specific options to filter only matching jobs
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Sections */}
        <div className="space-y-6">
          {/* Location Preferences */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Location</h3>
                <p className="text-sm text-slate-500">Where should jobs be located?</p>
              </div>
            </div>
            <LocationSelector
              selectedLocations={selectedLocations}
              onLocationsChange={setSelectedLocations}
              includeRemote={true}
            />
          </div>

          {/* Salary, Job Type, Work Arrangement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Salary Preferences */}
            <PreferenceSection
              icon={<DollarSign className="w-5 h-5" />}
              title="Salary Range"
              description="Target compensation"
              options={SALARY_OPTIONS}
              selectedOptions={selectedSalaryRanges}
              onToggle={(item) => toggleSelection(item, selectedSalaryRanges, setSelectedSalaryRanges)}
              color="green"
            />

            {/* Job Type Preferences */}
            <PreferenceSection
              icon={<Briefcase className="w-5 h-5" />}
              title="Job Type"
              description="Type of employment"
              options={JOB_TYPE_OPTIONS}
              selectedOptions={selectedJobTypes}
              onToggle={(item) => toggleSelection(item, selectedJobTypes, setSelectedJobTypes)}
              color="blue"
            />

            {/* Work Arrangement Preferences */}
            <PreferenceSection
              icon={<Home className="w-5 h-5" />}
              title="Work Arrangement"
              description="Work setting"
              options={WORK_ARRANGEMENT_OPTIONS}
              selectedOptions={selectedWorkArrangements}
              onToggle={(item) => toggleSelection(item, selectedWorkArrangements, setSelectedWorkArrangements)}
              color="purple"
            />
          </div>
        </div>

        {/* Apply to All Queues Toggle */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <Label htmlFor="apply-all" className="text-sm font-semibold text-slate-900 cursor-pointer">
                Apply these preferences to all queues
              </Label>
              <p className="text-xs text-slate-600 mt-1">
                This will override the current preferences for all your queues
              </p>
            </div>
            <Switch
              id="apply-all"
              checked={applyToAllQueues}
              onCheckedChange={setApplyToAllQueues}
              className="data-[state=checked]:bg-[#ff6b35]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PreferenceSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  color: 'orange' | 'green' | 'blue' | 'purple';
}

const PreferenceSection: React.FC<PreferenceSectionProps> = ({
  icon,
  title,
  description,
  options,
  selectedOptions,
  onToggle,
  color
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const colorClasses = {
    orange: {
      icon: 'text-orange-600 bg-orange-100',
      selected: 'bg-orange-50 border-orange-500 text-orange-900',
      hover: 'hover:border-orange-300'
    },
    green: {
      icon: 'text-green-600 bg-green-100',
      selected: 'bg-green-50 border-green-500 text-green-900',
      hover: 'hover:border-green-300'
    },
    blue: {
      icon: 'text-blue-600 bg-blue-100',
      selected: 'bg-blue-50 border-blue-500 text-blue-900',
      hover: 'hover:border-blue-300'
    },
    purple: {
      icon: 'text-purple-600 bg-purple-100',
      selected: 'bg-purple-50 border-purple-500 text-purple-900',
      hover: 'hover:border-purple-300'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full text-left cursor-pointer bg-transparent border-none p-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option);
            const isNoPreference = option === 'No Preference';

            return (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                  isSelected
                    ? colors.selected
                    : `bg-white border-slate-200 text-slate-700 ${colors.hover}`
                } ${isNoPreference ? 'border-dashed' : ''}`}
              >
                <span>{option}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selection Count */}
      {selectedOptions.length > 0 && (
        <p className="text-xs text-slate-500">
          {selectedOptions.includes('No Preference') 
            ? 'All options accepted' 
            : `${selectedOptions.length} selected`}
        </p>
      )}
    </div>
  );
};
