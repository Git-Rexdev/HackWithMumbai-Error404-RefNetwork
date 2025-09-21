import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { User, Mail, UserCheck } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-800 dark:bg-black border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={user?.name || ''}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                {/* Role */}
                <div>
                  <Label htmlFor="role" className="flex items-center space-x-2 mb-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Role</span>
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;