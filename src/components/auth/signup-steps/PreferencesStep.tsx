import React, { useState } from 'react';
import { Check, MapPin, DollarSign, Briefcase, Home, Info, ChevronDown, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { LocationSelector } from '../../common/LocationSelector';

interface PreferencesSetupProps {
  onComplete: (preferences: IndividualJobPreferences) => void;
  onBack?: () => void;
  userName: string;
  error?: string | null;
  isLoading?: boolean;
}

// Individual preference fields (replacing nested JobPreferences object)
export interface IndividualJobPreferences {
  preferredLocations: string[];
  preferredSalaryRanges: string[];
  preferredJobTypes: string[];
  preferredWorkArrangements: string[];
}

// Location options are now handled by LocationSelector component

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

export const PreferencesSetup: React.FC<PreferencesSetupProps> = ({
  onComplete,
  onBack,
  userName,
  error,
  isLoading = false
}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkArrangements, setSelectedWorkArrangements] = useState<string[]>([]);

  const toggleSelection = (
    item: string,
    currentSelections: string[],
    setSelections: React.Dispatch<React.SetStateAction<string[]>>,
    _options: string[]
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

  const handleContinue = () => {
    console.log('[PreferencesStep] handleContinue called');
    const preferences: IndividualJobPreferences = {
      preferredLocations: selectedLocations.length > 0 ? selectedLocations : ['No Preference'],
      preferredSalaryRanges: selectedSalaryRanges.length > 0 ? selectedSalaryRanges : ['No Preference'],
      preferredJobTypes: selectedJobTypes.length > 0 ? selectedJobTypes : ['No Preference'],
      preferredWorkArrangements: selectedWorkArrangements.length > 0 ? selectedWorkArrangements : ['No Preference']
    };
    onComplete(preferences);
  };

  // Allow continue always (skip functionality)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-3xl mb-2">
              <span className="text-slate-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </h1>
          </div>
          <h2 className="text-2xl text-slate-900 mb-2">
            Welcome, {userName}! 👋
          </h2>
          <p className="text-slate-600 text-lg mb-4">
            Let's personalize your job search experience
          </p>
          
          {/* Info Banner */}
          <div className="max-w-[95vw] sm:max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-900">
                  <strong>How preferences work:</strong> Your selections will be the default for all your queues.
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  • Select <strong>"No Preference"</strong> to be considered for any type in that category
                </p>
                <p className="text-sm text-blue-800">
                  • Choose specific options to <strong>only</strong> receive recommendations matching those criteria
                </p>
                <p className="text-sm text-blue-800">
                  • <strong>You can edit preferences for each queue later</strong> or skip this step to keep all preferences open
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`max-w-[95vw] sm:max-w-2xl mx-auto border rounded-lg p-4 mb-6 ${error.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {error.includes('successfully') ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm ${error.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Location Preferences - Full Width */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900">Location</h3>
                <p className="text-sm text-slate-500">Where do you want to work?</p>
              </div>
            </div>
            <LocationSelector
              selectedLocations={selectedLocations}
              onLocationsChange={setSelectedLocations}
              includeRemote={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Salary Preferences */}
            <PreferenceSection
              icon={<DollarSign className="w-5 h-5" />}
              title="Salary Range"
              description="What's your target compensation?"
              options={SALARY_OPTIONS}
              selectedOptions={selectedSalaryRanges}
              onToggle={(item) => toggleSelection(item, selectedSalaryRanges, setSelectedSalaryRanges, SALARY_OPTIONS)}
              color="green"
            />

            {/* Job Type Preferences */}
            <PreferenceSection
              icon={<Briefcase className="w-5 h-5" />}
              title="Job Type"
              description="What type of role are you seeking?"
              options={JOB_TYPE_OPTIONS}
              selectedOptions={selectedJobTypes}
              onToggle={(item) => toggleSelection(item, selectedJobTypes, setSelectedJobTypes, JOB_TYPE_OPTIONS)}
              color="blue"
            />

            {/* Work Arrangement Preferences */}
            <PreferenceSection
              icon={<Home className="w-5 h-5" />}
              title="Work Arrangement"
              description="How do you prefer to work?"
              options={WORK_ARRANGEMENT_OPTIONS}
              selectedOptions={selectedWorkArrangements}
              onToggle={(item) => toggleSelection(item, selectedWorkArrangements, setSelectedWorkArrangements, WORK_ARRANGEMENT_OPTIONS)}
              color="purple"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Profile
                </button>
              )}
            </div>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="px-8 py-3 rounded-lg transition-all bg-[#ff6b35] text-white hover:bg-[#e55a2b] shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                'Continue to Profile'
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-slate-500 mt-6">
          These preferences help us match you with the most relevant opportunities.
          <br />
          Don't worry — you can always change them later!
        </p>
      </div>
    </div>
  );
};

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
        className="w-full flex items-center justify-between bg-transparent border-0 p-0"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-2 pl-1">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option);
            const isNoPreference = option === 'No Preference';

            return (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-2 transition-all ${
                  isSelected
                    ? colors.selected
                    : `bg-white border-slate-200 text-slate-700 ${colors.hover}`
                } ${isNoPreference ? 'border-dashed' : ''}`}
              >
                <span className="text-sm">{option}</span>
                {isSelected && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selection Count */}
      {selectedOptions.length > 0 && (
        <p className="text-xs text-slate-500 pl-1">
          {selectedOptions.includes('No Preference') 
            ? 'Accepting all options' 
            : `${selectedOptions.length} selected`}
        </p>
      )}
    </div>
  );
};
