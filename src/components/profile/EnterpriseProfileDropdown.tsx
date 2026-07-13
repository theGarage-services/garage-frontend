import { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { recruiterProfileService, buildProfileImageUrl } from '@/api/recruiterProfile';
import {
  Settings,
  HelpCircle,
  Bug,
  LogOut,
  Shield,
  Download,
  ChevronDown,
  Building2,
  Users,
  BarChart3,
  FileText,
  Lock
} from 'lucide-react';

interface EnterpriseProfileDropdownProps {
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  user: any;
}

export function EnterpriseProfileDropdown({
  onNavigate,
  onLogout,
  user
}: Readonly<EnterpriseProfileDropdownProps>) {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    recruiterProfileService.getProfile().then((profile) => {
      const img = profile?.recruiter_profile_data?.profile_image;
      if (img) setProfileImage(buildProfileImageUrl(img));
    }).catch(() => {});
  }, []);
  
  // Get user info with defaults
  const userName = user ? `${user.firstName || 'Enterprise'} ${user.lastName || 'Admin'}` : 'Enterprise Admin';
  const userEmail = user?.email || 'admin@company.com';
  const userCompany = user?.company || 'Your Organization';
  const userInitials = userName.split(' ').map(n => n[0]).join('');

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
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
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
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-sm text-gray-600 truncate">{userEmail}</p>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Enterprise Admin
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Organization Info */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('institution-management')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-purple-50 rounded-lg"
        >
          <Building2 className="w-4 h-4 text-purple-600" />
          <div className="flex-1">
            <span className="text-purple-600 font-medium">{userCompany}</span>
            <p className="text-xs text-gray-500">Manage organization</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Enterprise Tools */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('homepage')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 text-gray-600" />
          <span>Admin Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('team-management')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Users className="w-4 h-4 text-gray-600" />
          <span>Team Management</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('institution-management')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Building2 className="w-4 h-4 text-gray-600" />
          <span>Company Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Compliance & Security */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('compliance-center')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <Lock className="w-4 h-4 text-gray-600" />
          <span>Compliance Center</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('audit-logs')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <FileText className="w-4 h-4 text-gray-600" />
          <span>Audit Logs</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Reports & Analytics */}
        <DropdownMenuItem 
          onClick={() => handleNavigation('analytics-dashboard')}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-orange-50 rounded-lg"
        >
          <BarChart3 className="w-4 h-4 text-[#ff6b35]" />
          <div className="flex-1">
            <span className="text-[#ff6b35] font-medium">Analytics Dashboard</span>
            <p className="text-xs text-gray-500">Enterprise insights</p>
          </div>
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
          <span>Export Data</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
