import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { AlertCircle } from 'lucide-react';

interface FormData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  website: string;
  foundedYear: string;
}

interface DetailsStepProps {
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

export function DetailsStep({ formData, errors, onChange }: Readonly<DetailsStepProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-500">Where is your organization located?</p>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Street address"
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          className={`h-12 border-2 ${errors.address ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.address} />
      </div>

      {/* City, State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="City"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={`h-12 border-2 ${errors.city ? 'border-red-300' : 'border-gray-200'}`}
          />
          <FieldError message={errors.city} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            placeholder="State or Province"
            value={formData.state}
            onChange={(e) => onChange('state', e.target.value)}
            className="h-12 border-2 border-gray-200"
          />
        </div>
      </div>

      {/* Country, Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Country"
            value={formData.country}
            onChange={(e) => onChange('country', e.target.value)}
            className={`h-12 border-2 ${errors.country ? 'border-red-300' : 'border-gray-200'}`}
          />
          <FieldError message={errors.country} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP/Postal Code</Label>
          <Input
            id="zipCode"
            placeholder="ZIP or Postal Code"
            value={formData.zipCode}
            onChange={(e) => onChange('zipCode', e.target.value)}
            className="h-12 border-2 border-gray-200"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="Main company phone number"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className={`h-12 border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.phone} />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://yourcompany.com"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          className={`h-12 border-2 ${errors.website ? 'border-red-300' : 'border-gray-200'}`}
        />
        <FieldError message={errors.website} />
      </div>

      {/* Founded Year */}
      <div className="space-y-2">
        <Label htmlFor="foundedYear">Founded Year (Optional)</Label>
        <Input
          id="foundedYear"
          placeholder="2010"
          value={formData.foundedYear}
          onChange={(e) => onChange('foundedYear', e.target.value)}
          className="h-12 border-2 border-gray-200"
        />
      </div>
    </div>
  );
}
