import { Card } from '../../ui/card';
import { CheckCircle, LucideIcon } from 'lucide-react';

interface Queue {
  id: string;
  name: string;
  industry: string;
  icon: LucideIcon;
  color: string;
  members: number;
  avgSalary: string;
  matchScore?: number;
  description: string;
  topSkills: string[];
  hiringTrends: string;
  responseRate: string;
}

interface QueueCardProps {
  queue: Queue;
  isSelected: boolean;
  onToggle: () => void;
  getQueueColor: (color: string) => string;
  industry?: string;
  level?: string;
}

export function QueueCard({ queue, isSelected, onToggle, getQueueColor, industry, level }: Readonly<QueueCardProps>) {
  const IconComponent = queue.icon;
  const displayName = industry?.trim() || queue.name;

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-[#ff6b35] border-[#ff6b35] bg-orange-50' : 'hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getQueueColor(queue.color).replace('text-', 'text-').replace('border-', '')}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{displayName}</h3>
            {level && <p className="text-sm text-gray-600">{level}</p>}
          </div>
        </div>
        {isSelected && <CheckCircle className="w-5 h-5 text-[#ff6b35]" />}
      </div>
    </Card>
  );
}
