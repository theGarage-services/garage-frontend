import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';
import { Eye, Loader2 } from 'lucide-react';
import { getPrivacySettings, updatePrivacySettings, type PrivacySettings } from '../../../api/approvals';

const defaultSettings: PrivacySettings = {
  profile_visibility: true,
  profile_visibility_level: 'recruiters',
  contact_preference: 'platform',
  anonymous_analytics: true,
  third_party_integrations: false,
};

export function PrivacyView() {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getPrivacySettings();
        if (isMounted) setSettings(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load privacy settings');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = async (next: Partial<PrivacySettings>) => {
    const previous = settings;
    const merged = { ...settings, ...next } as PrivacySettings;
    setSettings(merged);
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const data = await updatePrivacySettings(next);
      setSettings(data);
      setSuccess('Privacy settings saved');
    } catch (err: any) {
      setError(err.message || 'Failed to save privacy settings');
      setSettings(() => previous);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    const value = !settings[key];
    saveSettings({ [key]: value } as Partial<PrivacySettings>);
  };

  const handleSelect = (key: keyof PrivacySettings, value: string) => {
    saveSettings({ [key]: value } as Partial<PrivacySettings>);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#ff6b35]" />
          Privacy Controls
          {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
            <span className="ml-2 text-sm text-gray-600">Loading privacy settings...</span>
          </div>
        ) : (
          <div className="space-y-6">
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">Profile Visibility</h3>
                <p className="text-sm text-gray-600">Allow recruiters to find your profile</p>
              </div>
              <Switch
                checked={settings.profile_visibility}
                onCheckedChange={() => handleToggle('profile_visibility')}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Who can see your profile</Label>
              <Select
                value={settings.profile_visibility_level}
                onValueChange={(value) => handleSelect('profile_visibility_level', value)}
                disabled={saving}
              >
                <SelectTrigger id="profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiters">Recruiters only</SelectItem>
                  <SelectItem value="queue">People in my queue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-preference">Preferred contact method</Label>
              <Select
                value={settings.contact_preference}
                onValueChange={(value) => handleSelect('contact_preference', value)}
                disabled={saving}
              >
                <SelectTrigger id="contact-preference">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Through theGarage only</SelectItem>
                  <SelectItem value="email">Email directly</SelectItem>
                  <SelectItem value="phone">Phone calls allowed</SelectItem>
                  <SelectItem value="any">Any method</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Data Sharing</h3>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">Anonymous Usage Analytics</p>
                  <p className="text-sm text-gray-600">Help improve theGarage with anonymous data</p>
                </div>
                <Switch
                  checked={settings.anonymous_analytics}
                  onCheckedChange={() => handleToggle('anonymous_analytics')}
                  disabled={saving}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">Third-party Integrations</p>
                  <p className="text-sm text-gray-600">Allow integrations with LinkedIn, Indeed, etc.</p>
                </div>
                <Switch
                  checked={settings.third_party_integrations}
                  onCheckedChange={() => handleToggle('third_party_integrations')}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
