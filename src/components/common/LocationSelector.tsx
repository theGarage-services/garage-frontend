import { useState, SetStateAction } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { getCountries, getStates, getCities, formatLocation } from '../../utils/locationData';

interface LocationSelectorProps {
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  includeRemote?: boolean;
}

export function LocationSelector({ 
  selectedLocations, 
  onLocationsChange,
  includeRemote = true 
}: Readonly<LocationSelectorProps>) {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const countries = getCountries();
  const states = getStates(selectedCountry);
  const cities = getCities(selectedCountry, selectedState);

  const handleAddLocation = () => {
    if (selectedCity && selectedState && selectedCountry) {
      const formattedLocation = formatLocation(selectedCity, selectedState, selectedCountry);
      
      // Remove "No Preference" if it exists when adding a specific location
      const filteredLocations = selectedLocations.filter(loc => loc !== 'No Preference');
      
      if (!filteredLocations.includes(formattedLocation)) {
        onLocationsChange([...filteredLocations, formattedLocation]);
      }

      // Reset selections
      setSelectedCity('');
      setSelectedState('');
      setSelectedCountry('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    onLocationsChange(selectedLocations.filter(loc => loc !== location));
  };

  const handleToggleRemote = () => {
    // Remove "No Preference" if it exists when adding a specific location
    const filteredLocations = selectedLocations.filter(loc => loc !== 'No Preference');
    
    if (filteredLocations.includes('Remote')) {
      onLocationsChange(filteredLocations.filter(loc => loc !== 'Remote'));
    } else {
      onLocationsChange([...filteredLocations, 'Remote']);
    }
  };

  const isRemoteSelected = selectedLocations.includes('Remote');
  const canAddLocation = selectedCity && selectedState && selectedCountry;

  return (
    <div className="space-y-4">
      {/* Location Builder */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Country Selector */}
          <div className="space-y-2">
            <label htmlFor="location-country" className="text-sm text-gray-600">Country</label>
            <Select value={selectedCountry} onValueChange={(value: SetStateAction<string>) => {
              setSelectedCountry(value);
              setSelectedState('');
              setSelectedCity('');
            }}>
              <SelectTrigger id="location-country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State/Province Selector */}
          <div className="space-y-2">
            <label htmlFor="location-state" className="text-sm text-gray-600">
              {selectedCountry === 'USA' ? 'State' : 'Province'}
            </label>
            <Select
              value={selectedState}
              onValueChange={(value: SetStateAction<string>) => {
                setSelectedState(value);
                setSelectedCity('');
              }}
              disabled={!selectedCountry}
            >
              <SelectTrigger id="location-state" className="w-full">
                <SelectValue placeholder={selectedCountry ? `Select ${selectedCountry === 'USA' ? 'state' : 'province'}` : 'Select country first'} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selector */}
          <div className="space-y-2">
            <label htmlFor="location-city" className="text-sm text-gray-600">City</label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedState}
            >
              <SelectTrigger id="location-city" className="w-full">
                <SelectValue placeholder={selectedState ? 'Select city' : 'Select state first'} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Location Button */}
        <Button
          type="button"
          onClick={handleAddLocation}
          disabled={!canAddLocation}
          className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Special Options: Remote & No Preference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {includeRemote && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Remote Work</p>
                <p className="text-xs text-gray-600">Fully remote positions</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleToggleRemote}
              variant={isRemoteSelected ? 'default' : 'outline'}
              size="sm"
              className={isRemoteSelected ? 'bg-purple-600 hover:bg-purple-700 text-white self-start sm:self-auto' : 'self-start sm:self-auto'}
            >
              {isRemoteSelected ? 'Selected' : 'Add'}
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">No Preference</p>
              <p className="text-xs text-gray-600">Open to any location</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onLocationsChange(['No Preference'])}
            variant={selectedLocations.includes('No Preference') ? 'default' : 'outline'}
            size="sm"
            className={selectedLocations.includes('No Preference') ? 'bg-gray-600 hover:bg-gray-700 text-white self-start sm:self-auto' : 'self-start sm:self-auto'}
          >
            {selectedLocations.includes('No Preference') ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>

      {/* Selected Locations */}
      {selectedLocations.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Selected Locations ({selectedLocations.length})</label>
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map((location) => (
              <Badge
                key={location}
                className={`px-3 py-1.5 ${
                  location === 'Remote'
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-orange-100 text-[#ff6b35] hover:bg-orange-200'
                }`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {location}
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(location)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* No Locations Selected Message */}
      {selectedLocations.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No locations selected</p>
          <p className="text-xs text-gray-400 mt-1">Select a location above to get started</p>
        </div>
      )}
    </div>
  );
}
