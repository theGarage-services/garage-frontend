import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  ArrowLeft,
  Users, 
  UserCheck,
  Briefcase, 
  Target,
  TrendingUp,
  Building2,
  Star,
  CheckCircle,
  Award,
  BarChart3,
  Zap,
  MessageCircle,
  Calendar,
  Search,
  Eye,
  Shield,
  Layers,
  Network,
  Workflow,
  ArrowRight,
  Plus,
  Bell} from 'lucide-react';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';

interface EcosystemOverviewProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export function EcosystemOverview({ onBack, onNavigate, user, onLogout }: Readonly<EcosystemOverviewProps>) {
  const [selectedFlow, setSelectedFlow] = useState('complete');

  // Complete platform ecosystem data
  const ecosystemComponents = {
    jobSeekers: {
      title: 'Job Seekers',
      count: '89,234+',
      features: [
        { name: 'Profile & Resume Management', icon: Users, status: 'active' },
        { name: 'Queue-Based Job Discovery', icon: Search, status: 'active' },
        { name: 'Application Tracking System', icon: BarChart3, status: 'active' },
        { name: 'Direct Recruiter Communication', icon: MessageCircle, status: 'active' },
        { name: 'Interview Scheduling', icon: Calendar, status: 'active' },
        { name: 'Real-time Notifications', icon: Bell, status: 'active' }
      ],
      benefits: [
        'Join professional queues by expertise',
        'Get discovered by relevant recruiters',
        'Track all applications in one place',
        'Receive personalized job recommendations',
        'Direct communication with hiring teams'
      ]
    },
    recruiters: {
      title: 'Recruiters',
      count: '8,456+',
      features: [
        { name: 'Candidate Queue Sourcing', icon: Target, status: 'active' },
        { name: 'Job Posting & Management', icon: Briefcase, status: 'active' },
        { name: 'AI-Powered Candidate Matching', icon: Zap, status: 'active' },
        { name: 'Interview Management System', icon: Calendar, status: 'active' },
        { name: 'Team Collaboration Tools', icon: Users, status: 'active' },
        { name: 'Hiring Analytics Dashboard', icon: BarChart3, status: 'active' }
      ],
      benefits: [
        'Access pre-qualified candidate pools',
        'AI-powered candidate ranking',
        'Streamlined interview coordination',
        'Comprehensive hiring analytics',
        'Team performance tracking'
      ]
    },
    companies: {
      title: 'Companies',
      count: '2,847+',
      features: [
        { name: 'Institution Profile Management', icon: Building2, status: 'active' },
        { name: 'Team Access Control', icon: Shield, status: 'active' },
        { name: 'Company-wide Analytics', icon: BarChart3, status: 'active' },
        { name: 'Brand Management', icon: Star, status: 'active' },
        { name: 'Hiring Pipeline Insights', icon: Workflow, status: 'active' },
        { name: 'Multi-Recruiter Coordination', icon: Network, status: 'active' }
      ],
      benefits: [
        'Centralized hiring operations',
        'Brand consistency across listings',
        'Team performance insights',
        'Streamlined approval processes',
        'Company-wide hiring metrics'
      ]
    }
  };

  const platformFlows = [
    {
      id: 'discovery',
      title: 'Talent Discovery Flow',
      description: 'How job seekers get discovered by recruiters',
      steps: [
        { actor: 'Job Seeker', action: 'Joins relevant professional queue', icon: Users },
        { actor: 'AI System', action: 'Ranks candidate based on skills & experience', icon: Zap },
        { actor: 'Recruiter', action: 'Searches queue with specific filters', icon: Target },
        { actor: 'Platform', action: 'Presents ranked candidate matches', icon: BarChart3 },
        { actor: 'Recruiter', action: 'Initiates direct communication', icon: MessageCircle }
      ]
    },
    {
      id: 'application',
      title: 'Job Application Flow',
      description: 'Traditional job application process enhanced',
      steps: [
        { actor: 'Job Seeker', action: 'Discovers job posting', icon: Search },
        { actor: 'Platform', action: 'Provides company & role insights', icon: Eye },
        { actor: 'Job Seeker', action: 'Applies with one-click', icon: Zap },
        { actor: 'System', action: 'Adds to application tracker', icon: BarChart3 },
        { actor: 'Recruiter', action: 'Reviews application with AI insights', icon: Target }
      ]
    },
    {
      id: 'hiring',
      title: 'Complete Hiring Flow',
      description: 'End-to-end hiring process',
      steps: [
        { actor: 'Recruiter', action: 'Posts job with detailed requirements', icon: Plus },
        { actor: 'Platform', action: 'Suggests relevant candidate queues', icon: Zap },
        { actor: 'Job Seekers', action: 'Apply or get sourced from queues', icon: Users },
        { actor: 'AI System', action: 'Ranks and matches candidates', icon: BarChart3 },
        { actor: 'Recruiter', action: 'Interviews and makes hiring decision', icon: CheckCircle }
      ]
    }
  ];

  const currentFlow = platformFlows.find(f => f.id === selectedFlow) || platformFlows[0];

  const platformStats = {
    totalInteractions: '2.3M+',
    successfulHires: '12,847',
    averageTimeToHire: '16 days',
    platformRating: '4.8/5.0',
    monthlyGrowth: '+23%',
    userRetention: '95%'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                    <Network className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-medium text-gray-900">Complete Ecosystem</span>
                </div>
              </div>
            </div>

            <RecruiterProfileDropdown 
              onNavigate={onNavigate}
              onLogout={onLogout}
              user={user}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            <span className="text-black">the</span><span className="text-[#ff6b35]">Garage</span> Complete Ecosystem
          </h1>
          <p className="text-gray-600 max-w-[95vw] sm:max-w-3xl mx-auto mb-8">
            A comprehensive view of how theGarage connects job seekers, recruiters, and companies in a seamless hiring ecosystem 
            powered by AI and designed for mutual success.
          </p>
          
          {/* Platform Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {Object.entries(platformStats).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-xl font-medium text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem Components */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-8 text-center">Platform Participants</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {Object.entries(ecosystemComponents).map(([key, component]) => {
              const gradients: Record<string, string> = {
                jobSeekers: 'from-blue-50 to-blue-100 border-blue-200',
                recruiters: 'from-orange-50 to-orange-100 border-orange-200',
                companies: 'from-purple-50 to-purple-100 border-purple-200'
              };
              
              const iconColors: Record<string, string> = {
                jobSeekers: 'from-blue-500 to-blue-600',
                recruiters: 'from-[#ff6b35] to-[#ff8c42]',
                companies: 'from-purple-500 to-purple-600'
              };

              return (
                <Card key={key} className={`p-8 bg-gradient-to-br ${gradients[key]} hover:shadow-xl transition-all duration-300`}>
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${iconColors[key]} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      {key === 'jobSeekers' && <Users className="w-8 h-8 text-white" />}
                      {key === 'recruiters' && <UserCheck className="w-8 h-8 text-white" />}
                      {key === 'companies' && <Building2 className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{component.title}</h3>
                    <div className="text-2xl font-medium text-gray-900 mb-2">{component.count}</div>
                    <p className="text-sm text-gray-600">Active users</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-900">Key features:</h4>
                    {component.features.map((feature) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={feature.name} className="flex items-center gap-3 p-2 bg-white/50 rounded">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{feature.name}</span>
                          <div className="ml-auto">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Benefits:</h4>
                    {component.benefits.slice(0, 3).map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Platform Flows */}
        <div className="mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-8 text-center">Platform Workflows</h2>
          
          {/* Flow Selector */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {platformFlows.map((flow) => (
              <Button
                key={flow.id}
                variant={selectedFlow === flow.id ? 'default' : 'outline'}
                onClick={() => setSelectedFlow(flow.id)}
                className={selectedFlow === flow.id ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
              >
                {flow.title}
              </Button>
            ))}
          </div>

          <Card className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">{currentFlow.title}</h3>
              <p className="text-gray-600">{currentFlow.description}</p>
            </div>

            <div className="space-y-6">
              {currentFlow.steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.action} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-[#ff6b35]" />
                        <div>
                          <div className="font-medium text-gray-900">{step.actor}</div>
                          <div className="text-sm text-gray-600">{step.action}</div>
                        </div>
                      </div>
                    </div>
                    {index < currentFlow.steps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Quick Access to Key Pages */}
        <Card className="p-8 bg-gradient-to-r from-gray-50 to-orange-50 border-orange-200">
          <h3 className="text-2xl font-medium text-gray-900 mb-6 text-center">Explore the Platform</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => onNavigate('platform-overview')}
              variant="outline"
              className="p-6 h-auto border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white flex flex-col items-center gap-2"
            >
              <BarChart3 className="w-6 h-6" />
              <span>Platform Overview</span>
            </Button>
            <Button
              onClick={() => onNavigate('success-stories')}
              variant="outline"
              className="p-6 h-auto border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white flex flex-col items-center gap-2"
            >
              <Award className="w-6 h-6" />
              <span>Success Stories</span>
            </Button>
            <Button
              onClick={() => onNavigate('metrics-dashboard')}
              variant="outline"
              className="p-6 h-auto border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white flex flex-col items-center gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Live Metrics</span>
            </Button>
            <Button
              onClick={() => onNavigate('dual-demo')}
              variant="outline"
              className="p-6 h-auto border-green-500 text-green-600 hover:bg-green-500 hover:text-white flex flex-col items-center gap-2"
            >
              <Layers className="w-6 h-6" />
              <span>Interactive Demo</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}