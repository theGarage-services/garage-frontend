import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface ApplicationStatusCardProps {
  hasApplied: boolean;
  considerationStatus?: string;
  applicationMethod?: 'manual' | 'quick-apply' | 'recruiter-consideration';
  isPremium: boolean;
}

export function ApplicationStatusCard({
  hasApplied,
  considerationStatus,
  applicationMethod,
  isPremium
}: Readonly<ApplicationStatusCardProps>) {
  const isApplied = hasApplied || considerationStatus === 'accepted';

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
        <div className="space-y-3">
          {isApplied ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-800">Applied</span>
                {applicationMethod && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {applicationMethod === 'quick-apply'
                      ? 'Quick Apply'
                      : applicationMethod === 'manual'
                        ? 'Manual'
                        : 'Recruiter Selected'}
                  </Badge>
                )}
              </div>
              {!isPremium && applicationMethod === 'recruiter-consideration' && (
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <MessageCircle className="w-3 h-3 inline mr-1" />
                    <strong>Chat Enabled:</strong> This recruiter reached out to you first - you can
                    message them even as a basic user!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm font-medium text-gray-600">Not Applied</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
