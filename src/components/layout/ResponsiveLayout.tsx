import { useState } from 'react';
import { Menu, X, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

export function ResponsiveLayout({ children, user, onLogout, onNavigate }: Readonly<ResponsiveLayoutProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: 'homepage', icon: '🏠' },
    { name: 'Job Tracker', href: 'tracker', icon: '📋' },
    { name: 'My Queues', href: 'my-queues', icon: '📊' },
    { name: 'Profile', href: 'profile', icon: '👤' },
    { name: 'Notifications', href: 'notifications', icon: '🔔' },
    { name: 'Settings', href: 'settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="text-slate-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onNavigate?.(item.href)}
                  className="text-gray-600 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium transition-colors"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* Profile Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </Button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="inline h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="inline h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate?.(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-[#ff6b35] hover:bg-gray-50 rounded-md"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Optional) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.name}
              onClick={() => onNavigate?.(item.href)}
              className="flex flex-col items-center py-2 px-1 text-xs text-gray-600 hover:text-[#ff6b35]"
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
