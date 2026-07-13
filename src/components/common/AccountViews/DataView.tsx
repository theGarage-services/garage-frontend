import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';
import { Download, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { exportUserData, deleteAccount } from '../../../api/data';

export function DataManagementView() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportData = async () => {
    setError(null);
    setSuccess(null);
    setExporting(true);
    try {
      await exportUserData();
      setSuccess('Your data export has started.');
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      await deleteAccount();
      // Backend clears auth cookies; send the user to the home page.
      window.location.href = '/';
    } catch (err: any) {
      setDeleting(false);
      setError(err.message || 'Failed to delete account');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#ff6b35]" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Export Data */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Export Your Data</h3>
            <p className="text-sm text-gray-600">Download a copy of your theGarage data</p>
          </div>
          <Button
            onClick={handleExportData}
            variant="outline"
            disabled={exporting}
            className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Data
          </Button>
        </div>

        <Separator />

        {/* Delete Account */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-red-600">Delete Account</h3>
            <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
          </div>

          {showDeleteConfirm ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <p className="mb-3">This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    size="sm"
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Yes, Delete My Account
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    size="sm"
                    variant="outline"
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
