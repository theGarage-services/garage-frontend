import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { recruiterProfileService, buildProfileImageUrl } from '@/api/recruiterProfile';
import { companyService } from '@/api/companies';
import { 
  User, 
  Settings, 
  HelpCircle, 
  Bug, 
  LogOut, 
  Download, 
  ChevronDown,
  Briefcase,
  Building2,
  Plus,
  BarChart3,
  UserCheck,
  Zap} from 'lucide-react';

interface RecruiterProfileDropdownProps {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  user: any;
}

export function RecruiterProfileDropdown({ 
  onNavigate, 
  onLogout,
  user
}: Readonly<RecruiterProfileDropdownProps>) {
  const [open, setOpen] = useState(false);
  const [profileCompany, setProfileCompany] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [companyLogo, setCompanyLogo] = useState<string | undefined>(undefined);

  useEffect(() => {
    recruiterProfileService.getProfile().then((profile) => {
      if (profile?.recruiter_profile_data) {
        setProfileCompany(profile.recruiter_profile_data.company_name);
        const img = profile.recruiter_profile_data.profile_image;
        if (img) setProfileImage(buildProfileImageUrl(img));
      }
    });

    companyService.getMyCompany().then((company) => {
      if (company?.logo) {
        setCompanyLogo(buildProfileImageUrl(company.logo));
      }
    }).catch(() => {});
  }, []);
  
  // Get user info with defaults
  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const userEmail = user?.email;
  const userCompany = profileCompany ?? user?.company;
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('');

  const handleNavigation = (view: string) => {
    setOpen(false);
    onNavigate(view);
  };

  const handleLogout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpen(false);
    if (onLogout) {
      // Small delay to ensure dropdown closes before logout
      setTimeout(() => {
        onLogout();
      }, 100);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-9 px-2 hover:bg-orange-50 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:ring-offset-2">
          <Avatar className="w-7 h-7">
            <AvatarImage src={profileImage} />
            <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-full sm:w-80 p-2">
        {/* User Info Header */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-sm text-gray-600 truncate">{userEmail}</p>
              <p className="text-xs text-gray-500 truncate">{userCompany}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* About theGarage */}
        <DropdownMenuItem
          onClick={() => handleNavigation('company-edit')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          {companyLogo ? (
            <img src={companyLogo} alt="Company" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <Building2 className="w-4 h-4 text-[#ff6b35]" />
          )}
          <div className="flex-1">
            <span className="text-[#ff6b35] font-medium">My Company</span>
            <p className="text-xs text-gray-500">About {userCompany}</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Quick Actions - Only show for non-admin recruiters */}
        <>
          <DropdownMenuItem 
            onClick={() => handleNavigation('job-posting')}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-medium">Post New Job</span>
              <p className="text-xs text-gray-500">Create a new job posting</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </>

        {/* Profile & Navigation */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('recruiter-profile')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <User className="w-4 h-4 text-gray-600" />
          <span>My Profile</span>
        </DropdownMenuItem>



        {/* Recruiter Tools */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('job-management')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Briefcase className="w-4 h-4 text-gray-600" />
          <span>My Job Postings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('candidate-management')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <UserCheck className="w-4 h-4 text-gray-600" />
          <span>Candidate Management</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('queue-sourcing')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Zap className="w-4 h-4 text-gray-600" />
          <span>Queue Sourcing</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Platform Insights */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('platform-overview')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 text-[#ff6b35]" />
          <div className="flex-1">
            <span className="text-[#ff6b35] font-medium">Platform Overview</span>
            <p className="text-xs text-gray-500">Comprehensive platform insights</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('metrics-dashboard')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <span>Metrics Dashboard</span>
        </DropdownMenuItem>



        <DropdownMenuItem 
          onClick={() => handleNavigation('settings')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Settings className="w-4 h-4 text-gray-600" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('support')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <HelpCircle className="w-4 h-4 text-gray-600" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('report-issue')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Bug className="w-4 h-4 text-gray-600" />
          <span>Report an Issue</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Data Export */}
        <DropdownMenuItem className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
          <Download className="w-4 h-4 text-gray-600" />
          <span>Export My Data</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-red-50 rounded-lg text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>

        {/* Footer */}
        <div className="px-3 py-2 mt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            theGarage Recruiter v2.1.0
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}