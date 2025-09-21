import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Briefcase, Users, FileText, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import api from '../../lib/api';
import { Job, Referral } from '../../types';
import FadeIn from '../animations/FadeIn';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    myApplications: 0,
    myReferrals: 0,
    pendingApprovals: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let jobs = [];
      let referrals = [];
      if (user?.role === 'employee') {
        // Only jobs created by employee
        const jobsResponse = await api.get('/jobs');
        jobs = (jobsResponse.data.jobs || []).filter((job: Job) => job.createdBy === user._id);
        setRecentJobs(jobs.slice(0, 5));
        // Only referrals for jobs created by employee
        const referralsResponse = await api.get('/referrals/employee/jobs');
        referrals = referralsResponse.data.referrals || [];
        setRecentReferrals(referrals.slice(0, 5));
      } else {
        const [jobsResponse, referralsResponse] = await Promise.all([
          api.get('/jobs'),
          api.get('/referrals/me')
        ]);
        jobs = jobsResponse.data.jobs || [];
        setRecentJobs(jobs.slice(0, 5));
        referrals = referralsResponse.data.referrals || [];
        setRecentReferrals(referrals.slice(0, 5));
      }

      // Calculate stats based on user role
      const statsData = {
        totalJobs: jobs.length,
        myApplications: user?.role === 'fresher' ? referrals.length : 0,
        myReferrals: user?.role === 'employee' ? referrals.length : 0,
        pendingApprovals: user?.role === 'admin' ? jobs.filter((job: Job) => !job.isApproved).length : 0,
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'fresher':
        return {
          title: 'Welcome to Your Job Search Dashboard',
          description: 'Find opportunities and track your applications',
          stats: [
            { label: 'Available Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600' },
            { label: 'My Applications', value: stats.myApplications, icon: FileText, color: 'text-green-600' },
          ]
        };
      case 'employee':
        return {
          title: 'Employee Dashboard',
          description: 'Manage your job postings and referrals',
          stats: [
            { label: 'Available Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600' },
            { label: 'My Referrals', value: stats.myReferrals, icon: Users, color: 'text-purple-600' },
          ]
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage the platform and oversee all activities',
          stats: [
            { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600' },
            { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-orange-600' },
            { label: 'Total Referrals', value: stats.myReferrals, icon: Users, color: 'text-purple-600' },
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to the referral portal',
          stats: []
        };
    }
  };

  const content = getRoleSpecificContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6">
      <FadeIn direction="up" delay={100}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{content.description}</p>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={index} direction="up" delay={200 + index * 100}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      {/* Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn direction="left" delay={500}>
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === 'employee' ? 'Recent Jobs Uploaded by You' : 'Recent Jobs'}
              </CardTitle>
              <CardDescription>
                {user?.role === 'employee' ? 'Jobs you have posted recently' : 'Latest job opportunities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job, index) => (
                    <FadeIn key={job._id} direction="up" delay={600 + index * 100}>
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(job.deadline).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            job.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {job.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </FadeIn>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No jobs available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recent Referrals/Applications */}
        <FadeIn direction="right" delay={500}>
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === 'fresher' ? 'My Applications' : 'Recent Referrals'}
              </CardTitle>
              <CardDescription>
                {user?.role === 'fresher' ? 'Your job applications' : 'Recent referral activities'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReferrals.length > 0 ? (
                  recentReferrals.map((referral, index) => (
                    <FadeIn key={referral._id} direction="up" delay={600 + index * 100}>
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{referral.fullName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{referral.job.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            referral.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            referral.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.status}
                          </span>
                        </div>
                      </div>
                    </FadeIn>
                  ))
                ) : (
                  <FadeIn direction="up" delay={600}>
                    <p className="text-gray-500 text-center py-4">
                      {user?.role === 'fresher' ? 'No applications yet' : 'No referrals yet'}
                    </p>
                  </FadeIn>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default Dashboard;
