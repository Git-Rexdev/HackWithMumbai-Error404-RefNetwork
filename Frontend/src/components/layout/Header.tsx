import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { LogOut, Menu, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-600 fixed top-0 left-0 right-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 ml-2 md:ml-0">
              <img 
                src="/logo192.png" 
                alt="Ref Network Logo" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ref Network</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300">Job Portal</p>
              </div>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gray-800 dark:bg-black border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/profile');
                        }}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </button>
                      
                      <button
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
                
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
