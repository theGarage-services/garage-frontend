import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { SecurityView } from './AccountViews/SecurityView';
import { NotificationsView } from './AccountViews/NotificationsView';
import { PrivacyView } from './AccountViews/PrivacyView';
import { BillingView } from './AccountViews/BillingView';
import { DataManagementView } from './AccountViews/DataView';

interface AccountSettingsProps {
  onBack: () => void;
  user?: any;
  userRole?: 'job-seeker' | 'recruiter' | 'admin';
}

export function AccountSettings({ onBack }: Readonly<AccountSettingsProps>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your theGarage account preferences</p>
          </div>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white border border-gray-200">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <SecurityView />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationsView />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacyView />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingView />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagementView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
