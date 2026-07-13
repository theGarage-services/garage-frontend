import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Lock, Shield, Smartphone, Globe, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { passwordResetService } from '../../../api/passwordReset';
import { mfaService, type MFAMethod, type MFAStatus, type MFASetupResponse } from '../../../api/mfa';
import { sessionService, type Session } from '../../../api/sessions';

const METHOD_LABELS: Record<MFAMethod, string> = {
  authenticator: 'Authenticator App',
  email: 'Email',
  sms: 'SMS',
};

export function SecurityView() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupResponse, setSetupResponse] = useState<MFASetupResponse | null>(null);
  const [setupMethod, setSetupMethod] = useState<MFAMethod | null>(null);
  const [setupCode, setSetupCode] = useState('');
  const [disableMethod, setDisableMethod] = useState<MFAMethod | null>(null);
  const [disablePassword, setDisablePassword] = useState('');

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await mfaService.getStatus();
      setStatus(data);
    } catch (error: any) {
      alert(error.message || 'Failed to load MFA status');
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await sessionService.listSessions();
      setSessions(data);
    } catch (error: any) {
      setSessionsError(error.message || 'Failed to load active sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await sessionService.revokeSession(sessionId);
      await loadSessions();
    } catch (error: any) {
      alert(error.message || 'Failed to revoke session');
    }
  };

  useEffect(() => {
    loadStatus();
    loadSessions();
  }, []);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await passwordResetService.changePassword(currentPassword, newPassword, confirmPassword);
      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleStartSetup = async (method: MFAMethod) => {
    setLoading(true);
    try {
      const data = await mfaService.setup(method);
      setSetupResponse(data);
      setSetupMethod(method);
      setSetupCode('');
    } catch (error: any) {
      alert(error.message || `Failed to start ${METHOD_LABELS[method]} MFA setup`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!setupMethod || !setupCode) return;
    setLoading(true);
    try {
      await mfaService.confirmSetup(setupMethod, setupCode);
      await loadStatus();
      setSetupResponse(null);
      setSetupMethod(null);
      setSetupCode('');
      alert(`${METHOD_LABELS[setupMethod]} MFA enabled`);
    } catch (error: any) {
      alert(error.message || 'Failed to confirm MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setSetupResponse(null);
    setSetupMethod(null);
    setSetupCode('');
  };

  const handleRequestDisable = (method: MFAMethod) => {
    setDisableMethod(method);
    setDisablePassword('');
  };

  const handleDisable = async () => {
    if (!disableMethod || !disablePassword) return;
    setLoading(true);
    try {
      await mfaService.disable(disableMethod, disablePassword);
      await loadStatus();
      setDisableMethod(null);
      setDisablePassword('');
      alert(`${METHOD_LABELS[disableMethod]} MFA disabled`);
    } catch (error: any) {
      alert(error.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDisable = () => {
    setDisableMethod(null);
    setDisablePassword('');
  };

  const parseUserAgent = (userAgent: string): string => {
    if (!userAgent) return 'Unknown browser';
    const ua = userAgent.toLowerCase();
    let browser = 'Unknown browser';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    let os = 'Unknown OS';
    if (ua.includes('windows nt')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = ua.includes('ipad') ? 'iPad' : 'iPhone';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('linux')) os = 'Linux';

    return `${browser} on ${os}`;
  };

  const formatDate = (isoString: string): string => {
    if (!isoString) return 'Unknown';
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#ff6b35]" />
          Password & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Change Password</h3>

          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </div>

        <Separator />

        {/* Two-Factor Authentication */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              {status?.enabled
                ? `MFA is enabled. Preferred method: ${METHOD_LABELS[status.preferred_method]}.`
                : 'Add an extra layer of security to your account'}
            </p>
          </div>

          {status?.enabled && (
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                You will be asked for a verification code from your preferred method when signing in.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {(['authenticator', 'email', 'sms'] as MFAMethod[]).map((method) => {
              const enabled = status?.methods[method] ?? false;
              const target = method === 'authenticator' ? null : status?.delivery_targets[method];
              return (
                <div
                  key={method}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{METHOD_LABELS[method]}</p>
                    <p className="text-sm text-gray-600">
                      {enabled ? 'Enabled' : 'Not set up'}
                      {target && ` • ${target}`}
                    </p>
                  </div>
                  {enabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestDisable(method)}
                      disabled={loading}
                      className="text-red-600 border-red-300 hover:bg-red-50 self-start sm:self-auto"
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartSetup(method)}
                      disabled={loading}
                      className="self-start sm:self-auto"
                    >
                      Set up
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {setupResponse && setupMethod && (
            <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              {setupMethod === 'authenticator' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <QRCodeSVG value={setupResponse.provisioning_uri!} size={200} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">Secret key</p>
                    <p className="font-mono text-sm text-gray-700 break-all">{setupResponse.secret}</p>
                  </div>
                </div>
              )}
              {setupMethod !== 'authenticator' && (
                <p className="text-sm text-gray-600">
                  A verification code has been sent to{' '}
                  <span className="font-medium">{setupResponse.masked_target}</span>. Enter it below to
                  confirm.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="mfa-setup-code">Verification Code</Label>
                <Input
                  id="mfa-setup-code"
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmSetup}
                  disabled={loading || setupCode.length < 6}
                  className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
                >
                  {loading ? 'Verifying...' : 'Enable'}
                </Button>
                <Button variant="outline" onClick={handleCancelSetup} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {disableMethod && (
            <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Disabling {METHOD_LABELS[disableMethod]} MFA requires your current password.
              </p>
              <div className="space-y-2">
                <Label htmlFor="disable-password">Current Password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDisable}
                  disabled={loading || !disablePassword}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? 'Disabling...' : 'Disable MFA'}
                </Button>
                <Button variant="outline" onClick={handleCancelDisable} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Active Sessions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Active Sessions</h3>
          {sessionsLoading && <p className="text-sm text-gray-600">Loading sessions...</p>}
          {sessionsError && !sessionsLoading && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {sessionsError}
            </div>
          )}
          {!sessionsLoading && !sessionsError && sessions.length === 0 && (
            <p className="text-sm text-gray-600">No active sessions found.</p>
          )}
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border ${
                  session.is_current
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      session.is_current ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {session.is_current ? (
                      <Smartphone className="w-4 h-4 text-green-600" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.is_current ? 'Current Session' : parseUserAgent(session.user_agent)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {parseUserAgent(session.user_agent)}
                      {session.location ? ` • ${session.location}` : ' • Unknown location'}
                      {session.ip_address && ` • ${session.ip_address}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last active {formatDate(session.last_active_at)}
                    </p>
                  </div>
                </div>
                {session.is_current ? (
                  <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Current</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50 self-start sm:self-auto"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
