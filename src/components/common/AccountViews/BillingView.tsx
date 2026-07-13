import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { CreditCard, Crown, Download } from 'lucide-react';

export function BillingView() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#ff6b35]" />
          Billing & Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </h3>
                {isPremium && <Crown className="w-4 h-4 text-[#ff6b35]" />}
              </div>
              <p className="text-sm text-gray-600">
                {isPremium ? '$19.99/month • Next billing: Jan 15, 2025' : 'Limited features'}
              </p>
            </div>
            <Button
              onClick={() => setIsPremium(!isPremium)}
              className={`${
                isPremium
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35]'
              } text-white`}
            >
              {isPremium ? 'Cancel Subscription' : 'Upgrade to Premium'}
            </Button>
          </div>
        </div>

        {isPremium && (
          <>
            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Payment Method</h3>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-600">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Billing History</h3>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">December 2024</p>
                    <p className="text-sm text-gray-600">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">$19.99</p>
                    <Button variant="ghost" size="sm" className="text-[#ff6b35]">
                      <Download className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">November 2024</p>
                    <p className="text-sm text-gray-600">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">$19.99</p>
                    <Button variant="ghost" size="sm" className="text-[#ff6b35]">
                      <Download className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
