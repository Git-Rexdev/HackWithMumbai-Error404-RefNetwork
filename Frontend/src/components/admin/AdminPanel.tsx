import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { AdminLogs } from '../../types';
import api from '../../lib/api';

const AdminPanel: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs);
    } catch (err) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      fetchLogs(); // Refresh data
    } catch (err) {
      console.error('Failed to approve job:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'fresher':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !logs) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Failed to load admin data'}</p>
        <Button onClick={fetchLogs} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const pendingJobs = logs.jobs.filter(job => !job.isApproved);
  const totalReferrals = logs.referrals.length;
  const pendingReferrals = logs.referrals.filter(ref => ref.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
  <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage users, jobs, and referrals across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.users.length}</div>
            <p className="text-xs text-muted-foreground">
              {logs.users.filter(u => u.isVerified).length} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingJobs.length} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {pendingReferrals} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReferrals > 0 ? Math.round(((totalReferrals - pendingReferrals) / totalReferrals) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              of referrals processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Job Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Job Approvals
          </CardTitle>
          <CardDescription>
            Jobs waiting for admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingJobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending job approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-500">
                      Posted: {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => approveJob(job._id)}
                      className="bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Recent Users
          </CardTitle>
          <CardDescription>
            Latest user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.users.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge className={user.isVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Referrals
          </CardTitle>
          <CardDescription>
            Latest referral applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.referrals.slice(0, 5).map((referral) => (
              <div key={referral._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {referral.candidateName || referral.fullName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {referral.job.title} at {referral.job.company}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied: {formatDate(referral.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(referral.status)}>
                    {referral.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
