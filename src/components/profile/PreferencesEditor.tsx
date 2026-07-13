import React, { useState } from 'react';
import { Check, MapPin, DollarSign, Briefcase, Home, Info, X, Save } from 'lucide-react';
import { IndividualJobPreferences } from '../auth/signup-steps/PreferencesStep';
import { LocationSelector } from '../common/LocationSelector';

interface PreferencesEditorProps {
  currentPreferences: IndividualJobPreferences;
  onSave: (preferences: IndividualJobPreferences) => void;
  onClose: () => void;
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

export const PreferencesEditor: React.FC<PreferencesEditorProps> = ({
  currentPreferences,
  onSave,
  onClose
}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    currentPreferences.preferredLocations || ['No Preference']
  );
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>(
    currentPreferences.preferredSalaryRanges || ['No Preference']
  );
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(
    currentPreferences.preferredJobTypes || ['No Preference']
  );
  const [selectedWorkArrangements, setSelectedWorkArrangements] = useState<string[]>(
    currentPreferences.preferredWorkArrangements || ['No Preference']
  );

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
    onSave(preferences);
  };

  const hasChanges = 
    JSON.stringify(selectedLocations) !== JSON.stringify(currentPreferences.preferredLocations) ||
    JSON.stringify(selectedSalaryRanges) !== JSON.stringify(currentPreferences.preferredSalaryRanges) ||
    JSON.stringify(selectedJobTypes) !== JSON.stringify(currentPreferences.preferredJobTypes) ||
    JSON.stringify(selectedWorkArrangements) !== JSON.stringify(currentPreferences.preferredWorkArrangements);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-t-2xl">
          <div>
            <h2 className="text-xl text-slate-900">Edit Job Preferences</h2>
            <p className="text-sm text-slate-600 mt-1">
              Update your preferences to refine AI-recommended roles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-blue-900">
                <strong>Impact on AI Recommendations:</strong>
              </p>
              <p className="text-sm text-blue-800 mt-1">
                • <strong>"No Preference"</strong> = You'll be considered for any type in that category
              </p>
              <p className="text-sm text-blue-800">
                • <strong>Specific selections</strong> = You'll only receive recommendations matching those criteria
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Content */}
        <div className="p-6 space-y-6">
          {/* Location Preferences */}
          <div className="space-y-3 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
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

          {/* Salary Preferences */}
          <PreferenceGroup
            icon={<DollarSign className="w-5 h-5" />}
            title="Salary Range"
            description="What's your target compensation?"
            options={SALARY_OPTIONS}
            selectedOptions={selectedSalaryRanges}
            onToggle={(item) => toggleSelection(item, selectedSalaryRanges, setSelectedSalaryRanges)}
            color="green"
          />

          {/* Job Type Preferences */}
          <PreferenceGroup
            icon={<Briefcase className="w-5 h-5" />}
            title="Job Type"
            description="What type of role are you seeking?"
            options={JOB_TYPE_OPTIONS}
            selectedOptions={selectedJobTypes}
            onToggle={(item) => toggleSelection(item, selectedJobTypes, setSelectedJobTypes)}
            color="blue"
          />

          {/* Work Arrangement Preferences */}
          <PreferenceGroup
            icon={<Home className="w-5 h-5" />}
            title="Work Arrangement"
            description="How do you prefer to work?"
            options={WORK_ARRANGEMENT_OPTIONS}
            selectedOptions={selectedWorkArrangements}
            onToggle={(item) => toggleSelection(item, selectedWorkArrangements, setSelectedWorkArrangements)}
            color="purple"
          />
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all ${
              hasChanges
                ? 'bg-[#ff6b35] text-white hover:bg-[#e55a2b] shadow-lg shadow-orange-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

interface PreferenceGroupProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  color: 'orange' | 'green' | 'blue' | 'purple';
}

const PreferenceGroup: React.FC<PreferenceGroupProps> = ({
  icon,
  title,
  description,
  options,
  selectedOptions,
  onToggle,
  color
}) => {
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
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colors.icon}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          const isNoPreference = option === 'No Preference';

          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? colors.selected
                  : `bg-white border-slate-200 text-slate-700 ${colors.hover}`
              } ${isNoPreference ? 'border-dashed col-span-2 md:col-span-3' : ''}`}
            >
              <span className="text-sm">{option}</span>
              {isSelected && (
                <Check className="w-4 h-4 flex-shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <p className="text-xs text-slate-500 mt-3">
        {(() => {
          const hasNoPreference = selectedOptions.includes('No Preference');
          if (hasNoPreference) {
            return 'Accepting all options in this category';
          }
          const optionCount = selectedOptions.length;
          return `${optionCount} option${optionCount === 1 ? '' : 's'} selected`;
        })()}
      </p>
    </div>
  );
};
