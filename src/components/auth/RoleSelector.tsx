import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Target, Building2, User, ArrowRight, ChevronLeft, Shield } from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelect: (role: 'job-seeker' | 'recruiter' | 'admin') => void;
  onBack: () => void;
}

export function RoleSelector({ onRoleSelect, onBack }: Readonly<RoleSelectorProps>) {
  const [selectedRole, setSelectedRole] = useState<'job-seeker' | 'recruiter' | 'admin' | null>(null);

  const roles = [
    {
      id: 'job-seeker' as const,
      title: 'Job Seeker',
      description: 'Find your dream job with AI-powered queues, track applications, and get ranked against other candidates',
      icon: User,
      features: [
        'Smart job queue placement',
        'Application tracking with Kanban boards',
        'Live profile upgrade suggestions',
        'Queue leaderboards and rankings',
        'Career change recommendations'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      id: 'recruiter' as const,
      title: 'Recruiter',
      description: 'Find top talent efficiently with candidate queues, manage job postings, and streamline your hiring process',
      icon: Building2,
      features: [
        'Candidate pool management',
        'Job posting creation and management',
        'Applicant tracking system',
        'Interview scheduling and notes',
        'Team collaboration tools'
      ],
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    },
    {
      id: 'admin' as const,
      title: 'Enterprise',
      description: 'Company-backed organization with full administrative capabilities across team management, system configuration, and analytics',
      icon: Shield,
      features: [
        'Company registration & profile setup',
        'User management with granular permissions',
        'System configuration & integrations',
        'Advanced reporting & analytics',
        'Compliance & audit logs'
      ],
      gradient: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Landing
          </button>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl">
              <span className="text-gray-900">the</span>
              <span className="text-[#ff6b35]">Garage</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl mb-6 text-gray-900 leading-tight">
            Choose Your Path
          </h1>
          <p className="text-xl text-gray-600 max-w-[95vw] sm:max-w-2xl mx-auto">
            Whether you're looking for your next opportunity or searching for top talent, 
            theGarage has the tools to help you succeed.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 ${
                  isSelected 
                    ? 'border-[#ff6b35] shadow-xl scale-105' 
                    : 'border-gray-200 hover:border-[#ff6b35]/50'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className={`bg-gradient-to-br ${role.bgGradient} p-6 rounded-2xl mb-6`}>
                  <div className={`w-16 h-16 bg-gradient-to-r ${role.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl mb-3 text-gray-900">{role.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{role.description}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 mb-3">Key Features:</h4>
                  {role.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-6 p-3 bg-[#ff6b35]/10 rounded-lg border border-[#ff6b35]/20">
                    <div className="flex items-center gap-2 text-[#ff6b35]">
                      <Target className="w-4 h-4" />
                      <span className="font-medium">Selected</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={() => selectedRole && onRoleSelect(selectedRole)}
            disabled={!selectedRole}
            size="lg"
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}