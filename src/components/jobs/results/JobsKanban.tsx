import { Card } from '../../ui/card';

const formatMatchScore = (score: number | undefined | null): string => {
  if (score == null || Number.isNaN(score)) return '0';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';

interface Candidate {
  id: string;
  name: string;
  title: string;
  status: string;
  appliedDate: string;
  matchScore?: number;
}

interface KanbanColumnProps {
  title: string;
  candidates: Candidate[];
  count: number;
  getStatusBadge: (status: string) => React.ReactNode;
  getDaysAgo: (dateString: string) => string;
}

export function KanbanColumn({
  title,
  candidates,
  count,
  getStatusBadge,
  getDaysAgo
}: Readonly<KanbanColumnProps>) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 min-w-[280px] sm:min-w-[320px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-gray-900">{title}</h3>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-3">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No candidates
          </div>
        ) : (
          candidates.map((candidate) => (
            <Card key={candidate.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                    {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-gray-900 truncate">{candidate.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{candidate.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(candidate.status)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{getDaysAgo(candidate.appliedDate)}</span>
                {candidate.matchScore !== undefined && candidate.matchScore !== null && (
                  <span className="text-orange-600">{formatMatchScore(candidate.matchScore)}%</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
