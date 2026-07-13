import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppHeader } from '../layout/AppHeader';
import { Progress } from '../ui/progress';
import { 
  Building2,
  Users,
  Settings,
  BarChart3,
  HelpCircle,
  Shield,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  FileText,
  Activity,
  BookOpen,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';

interface EnterpriseAdminDashboardProps {
  institution: any;
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  items: {
    id: string;
    title: string;
    description: string;
    status?: 'complete' | 'incomplete' | 'pending';
    action: () => void;
  }[];
}

export function EnterpriseAdminDashboard({ institution, user, onNavigate, onLogout }: Readonly<EnterpriseAdminDashboardProps>) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Calculate setup completion
  const setupTasks = [
    { name: 'Company Profile', complete: institution?.profileComplete || false },
    { name: 'Billing Setup', complete: institution?.billingSetup || false },
    { name: 'Security Policies', complete: institution?.securitySetup || false },
    { name: 'Branding', complete: institution?.brandingSetup || false },
    { name: 'Team Members', complete: (institution?.teamMembers?.length || 0) > 0 }
  ];

  const completionPercent = (setupTasks.filter(t => t.complete).length / setupTasks.length) * 100;

  // Define the 6 main sections based on the flowchart
  const dashboardSections: DashboardSection[] = [
    {
      id: 'registration-setup',
      title: 'Company Registration & Setup',
      description: 'Initial account setup and company configuration',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      items: [
        {
          id: 'register',
          title: 'Register Company Account',
          description: 'Create and verify your enterprise account',
          status: institution?.registered ? 'complete' : 'incomplete',
          action: () => onNavigate('company-registration')
        },
        {
          id: 'profile',
          title: 'Complete Company Profile',
          description: 'Add company details, mission, and values',
          status: institution?.profileComplete ? 'complete' : 'incomplete',
          action: () => onNavigate('company-profile-setup')
        },
        {
          id: 'settings',
          title: 'Configure Settings',
          description: 'Set up system preferences and defaults',
          status: institution?.settingsConfigured ? 'complete' : 'pending',
          action: () => onNavigate('system-settings')
        },
        {
          id: 'branding',
          title: 'Set Up Branding',
          description: 'Customize logos, colors, and themes',
          status: institution?.brandingSetup ? 'complete' : 'incomplete',
          action: () => onNavigate('branding-setup')
        },
        {
          id: 'security-policies',
          title: 'Define Security Policies',
          description: 'Establish security rules and protocols',
          status: institution?.securitySetup ? 'complete' : 'pending',
          action: () => onNavigate('security-policies')
        },
        {
          id: 'billing',
          title: 'Set Up Billing',
          description: 'Configure payment methods and billing',
          status: institution?.billingSetup ? 'complete' : 'incomplete',
          action: () => onNavigate('billing-setup')
        }
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage team members, roles, and permissions',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      items: [
        {
          id: 'create-users',
          title: 'Create User Accounts',
          description: 'Add new team members and recruiters',
          action: () => onNavigate('create-user')
        },
        {
          id: 'manage-permissions',
          title: 'Manage Permissions',
          description: 'Assign roles: Regular, Manager, Lead',
          action: () => onNavigate('permissions-management')
        },
        {
          id: 'reset-passwords',
          title: 'Reset Passwords',
          description: 'Handle password resets for team members',
          action: () => onNavigate('password-management')
        },
        {
          id: 'monitor-activity',
          title: 'Monitor User Activity',
          description: 'Track user logins and actions',
          action: () => onNavigate('user-activity-monitor')
        }
      ]
    },
    {
      id: 'system-configuration',
      title: 'System Configuration',
      description: 'Security, integrations, and system settings',
      icon: Settings,
      color: 'from-orange-500 to-orange-600',
      items: [
        {
          id: 'system-settings',
          title: 'Configure System Settings',
          description: 'General system preferences and defaults',
          action: () => onNavigate('system-configuration')
        },
        {
          id: 'integrations',
          title: 'Manage Integrations',
          description: 'Connect third-party tools and services',
          action: () => onNavigate('integrations')
        },
        {
          id: 'notifications',
          title: 'Set Up Notifications',
          description: 'Configure email and push notifications',
          action: () => onNavigate('notification-settings')
        },
        {
          id: 'security',
          title: 'Configure Security',
          description: 'Authentication, API access, IP whitelisting',
          action: () => onNavigate('security-configuration')
        },
        {
          id: 'authentication',
          title: 'Configure Authentication Settings',
          description: 'SSO, 2FA, and login policies',
          action: () => onNavigate('authentication-settings')
        },
        {
          id: 'api-access',
          title: 'Manage API Access',
          description: 'API keys and access tokens',
          action: () => onNavigate('api-management')
        },
        {
          id: 'ip-whitelist',
          title: 'Set Up IP Whitelisting',
          description: 'Restrict access by IP address',
          action: () => onNavigate('ip-whitelist')
        }
      ]
    },
    {
      id: 'reporting-analytics',
      title: 'Reporting & Analytics',
      description: 'Data insights, metrics, and exports',
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      items: [
        {
          id: 'generate-reports',
          title: 'Generate Reports',
          description: 'Create custom reports for your team',
          action: () => onNavigate('report-generator')
        },
        {
          id: 'system-metrics',
          title: 'View System Metrics',
          description: 'Monitor platform usage and performance',
          action: () => onNavigate('system-metrics')
        },
        {
          id: 'export-data',
          title: 'Export Data',
          description: 'Download data for external analysis',
          action: () => onNavigate('data-export')
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Help resources and customer support',
      icon: HelpCircle,
      color: 'from-cyan-500 to-cyan-600',
      items: [
        {
          id: 'submit-ticket',
          title: 'Submit Support Tickets',
          description: 'Get help from our support team',
          action: () => onNavigate('support-tickets')
        },
        {
          id: 'knowledge-base',
          title: 'View Knowledge Base',
          description: 'Browse articles and documentation',
          action: () => onNavigate('knowledge-base')
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          description: 'Reach out directly to our team',
          action: () => onNavigate('contact-support')
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance',
      description: 'Data governance, audit logs, and compliance',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      items: [
        {
          id: 'data-retention',
          title: 'Manage Data Retention',
          description: 'Configure data retention policies',
          action: () => onNavigate('data-retention')
        },
        {
          id: 'compliance-reports',
          title: 'Generate Compliance Reports',
          description: 'GDPR, CCPA compliance documentation',
          action: () => onNavigate('compliance-reports')
        },
        {
          id: 'audit-logs',
          title: 'Review Audit Logs',
          description: 'Track all system changes and access',
          action: () => onNavigate('audit-logs')
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <AppHeader
        userRole="admin"
        user={user}
        currentView="institution-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Page Title Section with Orange Gradient */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-white mb-1">Enterprise Admin Portal</h1>
                  <p className="text-orange-100">{institution?.name || 'Your Organization'}</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-orange-100 mb-1">Setup Completion</div>
              <div className="flex items-center gap-3">
                <Progress value={completionPercent} className="w-40 h-2 bg-white/20" />
                <span className="text-2xl text-white font-medium">{Math.round(completionPercent)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Status Alert */}
        {completionPercent < 100 && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Setup</h3>
                <p className="text-gray-600 mb-4">
                  Finish setting up your enterprise account to unlock all features. {setupTasks.filter(t => !t.complete).length} tasks remaining.
                </p>
                <div className="flex flex-wrap gap-2">
                  {setupTasks.filter(t => !t.complete).map((task) => (
                    <Badge key={task.name} variant="outline" className="bg-white">
                      {task.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-medium text-gray-900">{institution?.teamMembers?.length || 0}</div>
            </div>
            <div className="text-sm text-gray-600">Team Members</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-medium text-gray-900">
                {institution?.activeJobs || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600">Active Jobs</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-medium text-gray-900">
                {institution?.totalHires || 0}
              </div>
            </div>
            <div className="text-sm text-gray-600">Total Hires</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-medium text-gray-900">
                {institution?.growthRate || '+15'}%
              </div>
            </div>
            <div className="text-sm text-gray-600">Growth Rate</div>
          </Card>
        </div>

        {/* Quick Actions - Test New Components */}
        <Card className="mb-8 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              onClick={() => onNavigate('company-profile-setup')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-[#ff6b35] hover:text-[#ff6b35]"
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs text-center">Company Setup</span>
            </Button>
            <Button
              onClick={() => onNavigate('create-user')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-600 hover:text-purple-600"
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-xs text-center">Create User</span>
            </Button>
            <Button
              onClick={() => onNavigate('team-management')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-600 hover:text-blue-600"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs text-center">Manage Teams</span>
            </Button>
            <Button
              onClick={() => onNavigate('approval-queue')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-600 hover:text-green-600"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs text-center">Approvals</span>
            </Button>
            <Button
              onClick={() => onNavigate('documents')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-indigo-600 hover:text-indigo-600"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs text-center">Documents</span>
            </Button>
            <Button
              onClick={() => onNavigate('recruiter-dashboard')}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-600 hover:text-orange-600"
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs text-center">Recruiter View</span>
            </Button>
          </div>
        </Card>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;

            return (
              <Card
                key={section.id}
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {section.items.length} items
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50/50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-[#ff6b35] hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 group-hover:text-[#ff6b35] transition-colors">
                              {item.title}
                            </h4>
                            {item.status && (
                              <div className="flex-shrink-0 sm:ml-2 self-start sm:self-auto">
                                {item.status === 'complete' ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : item.status === 'pending' ? (
                                  <Clock className="w-5 h-5 text-yellow-500" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center gap-2 text-sm text-[#ff6b35] group-hover:gap-3 transition-all">
                            <span>Configure</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help Getting Started?</h3>
              <p className="text-gray-600 mb-4">
                Our comprehensive documentation and support team are here to help you set up your enterprise account.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate('knowledge-base')}
                  variant="outline"
                  className="bg-white hover:bg-gray-50"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
                <Button
                  onClick={() => onNavigate('contact-support')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}