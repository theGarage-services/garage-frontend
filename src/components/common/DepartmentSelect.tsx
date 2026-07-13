import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Code,
  Database,
  DollarSign,
  Headphones,
  Megaphone,
  Settings,
  Shield,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react';

export const DEPARTMENTS = [
  { value: 'operations', label: 'Operations', icon: Settings },
  { value: 'human-resources', label: 'Human Resources', icon: Users },
  { value: 'finance-and-accounting', label: 'Finance & Accounting', icon: DollarSign },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
  { value: 'sales', label: 'Sales', icon: ShoppingCart },
  { value: 'engineering', label: 'Engineering', icon: Code },
  { value: 'product', label: 'Product', icon: Target },
  { value: 'data-and-analytics', label: 'Data & Analytics', icon: Database },
  { value: 'customer-service', label: 'Customer Service', icon: Headphones },
  { value: 'legal-and-risk', label: 'Legal & Risk', icon: Shield },
] as const;

interface DepartmentSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function DepartmentSelect({
  value,
  onValueChange,
  triggerClassName,
  placeholder = 'Select department',
}: Readonly<DepartmentSelectProps>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
        {DEPARTMENTS.map(({ value, label, icon: Icon }) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
