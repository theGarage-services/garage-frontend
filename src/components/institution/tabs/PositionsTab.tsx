import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Plus, Eye } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface Position {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  postedBy: string;
  postedDate: string;
  applications: number;
  status: string;
}

interface PositionsTabProps {
  openPositions: Position[];
  onNavigate: (view: string) => void;
}

export function PositionsTab({ openPositions, onNavigate }: Readonly<PositionsTabProps>) {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900">Open Positions</h2>
        <Button
          onClick={() => onNavigate('job-management')}
          className="bg-[#ff6b35] hover:bg-[#e55a2b] flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      <div className="space-y-4">
        {openPositions.map((position) => (
          <div key={position.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900">{position.title}</h3>
                <StatusBadge status={position.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>{position.department}</span>
                <span>•</span>
                <span>{position.type}</span>
                <span>•</span>
                <span>{position.location}</span>
                <span>•</span>
                <span>Posted {new Date(position.postedDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{position.applications}</p>
                <p className="text-sm text-gray-500">Applications</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
