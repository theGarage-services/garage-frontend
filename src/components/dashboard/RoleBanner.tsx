import { Card } from '../ui/card';
import { Activity, Award, Users, Target, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '../../hooks/useDashboardData';

interface RoleBannerProps {
  userRole: UserRole;
  canPostWithoutApproval?: boolean;
}

interface RoleConfig {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  borderColor: string;
  title: string;
  titleColor: string;
  description: string;
  descColor: string;
}

const roleConfigs: Record<Exclude<UserRole, 'recruiter'>, RoleConfig> = {
  'hiring-manager': {
    icon: Award,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    cardBg: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Hiring Manager Access',
    titleColor: 'text-green-900',
    description: 'You can review candidates, schedule interviews, and make final hiring decisions for your assigned positions.',
    descColor: 'text-green-700'
  },
  manager: {
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    cardBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Manager Access',
    titleColor: 'text-purple-900',
    description: 'You can approve job postings, assign jobs to your team, monitor team performance, and review candidate shortlists.',
    descColor: 'text-purple-700'
  },
  lead: {
    icon: Target,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    cardBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Lead Recruiter Access',
    titleColor: 'text-orange-900',
    description: 'You have strategic oversight: view all teams, set quotas, analyze metrics, and make strategic hiring decisions.',
    descColor: 'text-orange-700'
  },
  admin: {
    icon: Shield,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    cardBg: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Enterprise Admin - Full System Control',
    titleColor: 'text-red-900',
    description: 'You are the only Admin. Only you can create user accounts and manage system settings.',
    descColor: 'text-red-700'
  }
};

function AdminBanner() {
  return (
    <Card className="p-4 bg-red-50 border-red-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-red-900 mb-2">Enterprise Admin - Full System Control</p>
          <p className="text-sm text-red-700 mb-3">
            You are the only Admin. Only you can create user accounts and manage system settings.
          </p>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <p className="text-xs font-medium text-red-900 mb-2">4 User Types You Can Create:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-700">
              <div>• <strong>Regular Recruiter</strong> - Execution</div>
              <div>• <strong>Manager</strong> - Team & Approvals</div>
              <div>• <strong>Lead</strong> - Strategic Oversight</div>
              <div>• <strong>Hiring Manager</strong> - Review & Decide</div>
            </div>
            <p className="text-xs text-red-600 mt-2 italic">
              Note: Cannot create additional Admins - only one per organization
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RecruiterBanner({ canPostWithoutApproval }: Readonly<{ canPostWithoutApproval?: boolean }>) {
  const styles = canPostWithoutApproval
    ? { cardBg: 'bg-green-50', borderColor: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600', titleColor: 'text-green-900', descColor: 'text-green-700', title: 'Trusted Recruiter Access', desc: 'You can create job postings, search candidates, and publish jobs directly without manager approval.' }
    : { cardBg: 'bg-blue-50', borderColor: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', titleColor: 'text-blue-900', descColor: 'text-blue-700', title: 'Regular Recruiter Access', desc: 'You can create job postings and search candidates. All job postings require manager approval before publishing.' };

  return (
    <Card className={`p-4 ${styles.cardBg} ${styles.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Activity className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div>
          <p className={`font-medium ${styles.titleColor}`}>{styles.title}</p>
          <p className={`text-sm ${styles.descColor} mt-1`}>{styles.desc}</p>
        </div>
      </div>
    </Card>
  );
}

function StandardRoleBanner({ config }: Readonly<{ config: RoleConfig }>) {
  const Icon = config.icon;
  return (
    <Card className={`p-4 ${config.cardBg} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className={`font-medium ${config.titleColor}`}>{config.title}</p>
          <p className={`text-sm ${config.descColor} mt-1`}>{config.description}</p>
        </div>
      </div>
    </Card>
  );
}

export function RoleBanner({ userRole, canPostWithoutApproval }: Readonly<RoleBannerProps>) {
  if (userRole === 'recruiter') {
    return <RecruiterBanner canPostWithoutApproval={canPostWithoutApproval} />;
  }

  if (userRole === 'admin') {
    return <AdminBanner />;
  }

  const config = roleConfigs[userRole];
  if (!config) return null;

  return <StandardRoleBanner config={config} />;
}
