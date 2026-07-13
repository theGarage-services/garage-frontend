import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export const INDUSTRIES = [
  { value: 'accountant', label: 'Accountant' },
  { value: 'advocate', label: 'Advocate' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'arts', label: 'Arts' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'aviation', label: 'Aviation' },
  { value: 'banking', label: 'Banking' },
  { value: 'bpo', label: 'Business Process Outsourcing' },
  { value: 'business-development', label: 'Business Development' },
  { value: 'chef', label: 'Chef' },
  { value: 'construction', label: 'Construction' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'designer', label: 'Designer' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'education', label: 'Education' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'information-technology', label: 'Information Technology' },
  { value: 'public-relations', label: 'Public Relations' },
  { value: 'sales', label: 'Sales' },
] as const;

interface IndustrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function IndustrySelect({
  value,
  onValueChange,
  triggerClassName,
  placeholder = 'Select industry',
}: Readonly<IndustrySelectProps>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-auto">
        {INDUSTRIES.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
