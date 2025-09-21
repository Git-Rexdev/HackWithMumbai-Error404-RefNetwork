import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminLogs } from '../../types';
import api from '../../lib/api';

const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/logs');
      setLogs(response.data.logs);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!logs) return null;

    const totalUsers = logs.users.length;
    const verifiedUsers = logs.users.filter(u => u.isVerified).length;
    const totalJobs = logs.jobs.length;
    const approvedJobs = logs.jobs.filter(j => j.isApproved).length;
    const totalReferrals = logs.referrals.length;
    const acceptedReferrals = logs.referrals.filter(r => r.status === 'accepted').length;
    const pendingReferrals = logs.referrals.filter(r => r.status === 'pending').length;
    const rejectedReferrals = logs.referrals.filter(r => r.status === 'rejected').length;

    // Role distribution
    const roleDistribution = logs.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends (simplified - in real app you'd have proper date grouping)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyJobs = logs.jobs.filter(job => {
      const jobDate = new Date(job.createdAt);
      return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
    }).length;

    const monthlyReferrals = logs.referrals.filter(ref => {
      const refDate = new Date(ref.createdAt);
      return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
    }).length;

    return {
      totalUsers,
      verifiedUsers,
      totalJobs,
      approvedJobs,
      totalReferrals,
      acceptedReferrals,
      pendingReferrals,
      rejectedReferrals,
      roleDistribution,
      monthlyJobs,
      monthlyReferrals,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      jobApprovalRate: totalJobs > 0 ? (approvedJobs / totalJobs) * 100 : 0,
      referralAcceptanceRate: totalReferrals > 0 ? (acceptedReferrals / totalReferrals) * 100 : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !logs || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Failed to load analytics'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
  <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Platform insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedUsers} verified ({stats.verificationRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedJobs} approved ({stats.jobApprovalRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedReferrals} accepted ({stats.referralAcceptanceRate.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyReferrals} referrals this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            User Role Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of users by role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.roleDistribution).map(([role, count]) => (
              <div key={role} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{role}s</div>
                <div className="text-xs text-gray-500">
                  {((count / stats.totalUsers) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Referral Status Breakdown
          </CardTitle>
          <CardDescription>
            Current status of all referral applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xs text-gray-500">
                {((stats.pendingReferrals / stats.totalReferrals) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{stats.acceptedReferrals}</div>
              <div className="text-sm text-gray-600">Accepted</div>
              <div className="text-xs text-gray-500">
                {((stats.acceptedReferrals / stats.totalReferrals) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{stats.rejectedReferrals}</div>
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-xs text-gray-500">
                {((stats.rejectedReferrals / stats.totalReferrals) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Platform Health Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Verification Rate</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.verificationRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.verificationRate.toFixed(1)}% of users are verified
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Job Approval Rate</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.jobApprovalRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.jobApprovalRate.toFixed(1)}% of jobs are approved
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Referral Acceptance Rate</h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${stats.referralAcceptanceRate}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.referralAcceptanceRate.toFixed(1)}% of referrals are accepted
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Monthly Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Jobs Posted:</span>
                  <span className="font-medium">{stats.monthlyJobs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Referrals Submitted:</span>
                  <span className="font-medium">{stats.monthlyReferrals}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
