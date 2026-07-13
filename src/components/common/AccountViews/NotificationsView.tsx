import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';
import { Bell, Loader2 } from 'lucide-react';
import { notificationService } from '../../../api/notifications';

const defaultPrefs = {
  emailNewApplications: true,
  emailStatusUpdates: true,
  emailWeeklyReport: true,
  pushNewApplications: true,
  pushInterviewReminders: true,
  pushMessages: false,
  smsImportantUpdates: false,
  smsInterviewReminders: false,
};

type PrefKey = keyof typeof defaultPrefs;

interface PrefItem {
  key: PrefKey;
  label: string;
  description: string;
}

const emailItems: PrefItem[] = [
  { key: 'emailNewApplications', label: 'New Applications', description: 'When you receive a new job application' },
  { key: 'emailStatusUpdates', label: 'Status Updates', description: 'Changes to your application or posting status' },
  { key: 'emailWeeklyReport', label: 'Weekly Report', description: 'A weekly summary of your activity' },
];

const pushItems: PrefItem[] = [
  { key: 'pushNewApplications', label: 'New Applications', description: 'When you receive a new job application' },
  { key: 'pushInterviewReminders', label: 'Interview Reminders', description: 'Upcoming interview notifications' },
  { key: 'pushMessages', label: 'Messages', description: 'New direct messages' },
];

const smsItems: PrefItem[] = [
  { key: 'smsImportantUpdates', label: 'Important Updates', description: 'Critical account and job updates' },
  { key: 'smsInterviewReminders', label: 'Interview Reminders', description: 'Upcoming interview notifications' },
];

export function NotificationsView() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const backendPrefs = await notificationService.getPreferences();
        if (isMounted && backendPrefs) {
          setPrefs(notificationService.transformDataForFrontend(backendPrefs) as Record<PrefKey, boolean>);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load preferences');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async (key: PrefKey) => {
    const previousPrefs = prefs;
    const nextPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(nextPrefs);
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const backendData = notificationService.transformDataForBackend(nextPrefs);
      await notificationService.updatePreferences(backendData);
      setSuccess('Preferences saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
      // Revert the optimistic toggle on error.
      setPrefs(() => previousPrefs);
    } finally {
      setSaving(false);
    }
  };

  const renderGroup = (title: string, items: PrefItem[]) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">Choose which {title.toLowerCase()} you want to receive.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <Switch
              checked={prefs[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
              disabled={loading || saving}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#ff6b35]" />
          Notification Preferences
          {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
            <span className="ml-2 text-sm text-gray-600">Loading preferences...</span>
          </div>
        ) : (
          <>
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {renderGroup('Email Notifications', emailItems)}
            <Separator />
            {renderGroup('Push Notifications', pushItems)}
            <Separator />
            {renderGroup('SMS Notifications', smsItems)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
