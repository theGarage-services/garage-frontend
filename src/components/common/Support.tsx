import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowLeft, Book, Video, CheckCircle, Star, ThumbsUp, ExternalLink, Users, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface SupportProps {
  onBack: () => void;
}

export function Support({ onBack }: Readonly<SupportProps>) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600">Get help with theGarage and find answers to common questions</p>
          </div>
        </div>

        <Tabs defaultValue="guides" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
          </TabsList>

          {/* Guides Section */}
          <TabsContent value="guides" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-[#ff6b35]" />
                  Help Guides & Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Quick Start Guide</h3>
                        <p className="text-sm text-gray-600">5 min read</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Learn how to set up your profile, apply to jobs, and track your applications.
                    </p>
                    <Button variant="outline" size="sm" className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Guide
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Job Queue System</h3>
                        <p className="text-sm text-gray-600">8 min read</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Understanding how queues work and how to optimize your queue selection.
                    </p>
                    <Button variant="outline" size="sm" className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Guide
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Profile Optimization</h3>
                        <p className="text-sm text-gray-600">12 min read</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Tips and best practices to make your profile stand out to recruiters.
                    </p>
                    <Button variant="outline" size="sm" className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Guide
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
                        <p className="text-sm text-gray-600">Watch & learn</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Step-by-step video guides for all theGarage features.
                    </p>
                    <Button variant="outline" size="sm" className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                      <Video className="w-4 h-4 mr-2" />
                      Watch Videos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-[#ff6b35]" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">How to write an effective job application</p>
                      <p className="text-sm text-gray-600">Tips for standing out to recruiters</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#ff6b35] self-start sm:self-auto">
                      Read
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Understanding job application statuses</p>
                      <p className="text-sm text-gray-600">What each stage means for your application</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#ff6b35] self-start sm:self-auto">
                      Read
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Maximizing your premium membership</p>
                      <p className="text-sm text-gray-600">Get the most out of premium features</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#ff6b35] self-start sm:self-auto">
                      Read
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Status */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      All systems operational. Last updated: 2 minutes ago
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Job Search & Applications</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Operational</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Job Tracker</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Operational</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Recruiter Chat</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Operational</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Notifications</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Operational</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Queue Analytics</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 self-start sm:self-auto">Operational</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h4 className="font-semibold text-green-900">System Maintenance Complete</h4>
                      <span className="text-sm text-green-700">2 hours ago</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Scheduled maintenance completed successfully. All features are now fully operational.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h4 className="font-semibold text-blue-900">New Feature Release</h4>
                      <span className="text-sm text-blue-700">1 day ago</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      Enhanced recruiter chat functionality with video call support and interview scheduling.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}