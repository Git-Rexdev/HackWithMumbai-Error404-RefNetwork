import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart3,
  Plus,
  CheckCircle,
  MessageSquare,
  Brain
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const fresherNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse Jobs', href: '/jobs', icon: Briefcase },
    { name: 'My Applications', href: '/applications', icon: FileText },
  ];

  const employeeNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Jobs', href: '/my-jobs', icon: Briefcase },
    { name: 'Create Job', href: '/create-job', icon: Plus },
    { name: 'Referrals', href: '/referrals', icon: Users },
  ];

  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'All Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Pending Approvals', href: '/approvals', icon: CheckCircle },
    { name: 'All Referrals', href: '/referrals', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Admin Panel', href: '/admin', icon: Users },
  ];

  const aiNavItem = { name: 'AI Assistance', href: '/ai', icon: Brain };
  const chatNavItem = { name: 'Chat', href: '/messages', icon: MessageSquare };

  const getNavItems = () => {
    switch (user?.role) {
      case 'fresher':
        return [...fresherNavItems, aiNavItem, chatNavItem];
      case 'employee':
        return [...employeeNavItems, aiNavItem, chatNavItem];
      case 'admin':
        return [...adminNavItems, aiNavItem, chatNavItem];
      default:
        return [aiNavItem, chatNavItem];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="bg-white dark:bg-black shadow-lg h-screen flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-600 h-16">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo192.png" 
            alt="Ref Network Logo" 
            className="h-8 w-8"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Ref Network</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">Job Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Error 404 at Bottom */}
      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <div
            className="text-gray-500 dark:text-gray-300 text-sm font-medium"
            style={{
              textShadow: "0 0 4px rgba(25, 118, 210, 0.3)"
            }}
          >
            Made By Team Error 404
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
