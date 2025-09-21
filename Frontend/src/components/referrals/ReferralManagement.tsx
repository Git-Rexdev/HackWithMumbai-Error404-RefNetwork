import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Calendar, User, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Referral } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import FadeIn from '../animations/FadeIn';

const ReferralManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();

  // Helper to ensure resumePath is absolute using env
  const API_BASE_URL = process.env.REACT_APP_API_URL?.replace(/\/?api\/?$/, '') || '';
  const getAbsoluteResumePath = (resumePath: string) => {
    if (!resumePath) return '';
    if (resumePath.startsWith('http')) return resumePath;
    // Use base URL from .env
    return `${API_BASE_URL}/${resumePath.replace(/^\//, '')}`;
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      let response;
      if (user?.role === 'employee') {
        response = await api.get('/referrals/employee/jobs');
      } else if (user?.role === 'admin') {
        response = await api.get('/referrals/applications');
      } else {
        response = await api.get('/referrals/me');
      }
      let allReferrals = response.data.referrals || [];

      // Filter by job if jobId is provided
      if (jobId) {
        allReferrals = allReferrals.filter((ref: Referral) => ref.job._id === jobId);
      }

      // Filter by status
      if (statusFilter !== 'all') {
        allReferrals = allReferrals.filter((ref: Referral) => ref.status === statusFilter);
      }

      setReferrals(allReferrals);
    } catch (err) {
      setError('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (referralId: string, newStatus: string) => {
    try {
      await api.patch(`/referrals/${referralId}/status`, { status: newStatus });
      fetchReferrals(); // Refresh the list
    } catch (err) {
      console.error('Failed to update referral status:', err);
    }
  };

  // Add chat handler

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchReferrals} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Add chat handler
  const handleChat = (referral: any) => {
    let userId = '';
    if (referral.candidate && typeof referral.candidate === 'object' && referral.candidate._id) {
      userId = referral.candidate._id;
    } else if (typeof referral.candidate === 'string') {
      userId = referral.candidate;
    }
    if (userId) {
      window.location.href = `/messages/${userId}`;
    } else {
      alert('No user available for chat. Please check if the candidate has a valid user account.');
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn direction="up" delay={100}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {jobId ? 'Job Referrals' : 'All Referrals'}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and review referral applications
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FadeIn>

      {referrals.length === 0 ? (
        <FadeIn direction="up" delay={300}>
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'all' ? 'No referrals have been submitted yet.' : `No ${statusFilter} referrals found.`}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="grid gap-6">
          {referrals.map((referral, index) => (
            <FadeIn key={referral._id} direction="up" delay={300 + index * 100}>
              <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {referral.candidateName || referral.fullName}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {referral.job ? `${referral.job.title} at ${referral.job.company}` : 'Job info unavailable'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(referral.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(referral.status)}
                        <span className="ml-1 capitalize">{referral.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-primary">Application Details</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-foreground">
                        <strong>Name:</strong> {referral.candidateName || referral.fullName}
                      </p>
                      {referral.candidateEmail && (
                        <p className="text-sm text-foreground">
                          <strong>Email:</strong> {referral.candidateEmail}
                        </p>
                      )}
                      {referral.coverLetter && (
                        <p className="text-sm text-foreground">
                          <strong>Cover Letter:</strong> {referral.coverLetter}
                        </p>
                      )}
                      <p className="text-sm text-foreground">
                        <strong>Why Better:</strong> {referral.whyBetter}
                      </p>
                      {referral.notes && (
                        <p className="text-sm text-foreground">
                          <strong>Notes:</strong> {referral.notes}
                        </p>
                      )}
                    </div>
                  </div>


                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Applied on {formatDate(referral.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 mr-1" />
                      {referral.resumeFileName}
                      {referral.resumePath ? (
                        <span className="ml-2 text-gray-400 text-xs"></span>
                      ) : (
                        <span className="ml-2 text-gray-400 text-xs">No resume uploaded</span>
                      )}
                    </div>
                  </div>

                  {(referral.status === 'pending' || referral.status === 'accepted') && (
                    <div className="flex space-x-2 pt-4 border-t">
                      {referral.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateReferralStatus(referral._id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      )}
                      {referral.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateReferralStatus(referral._id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChat(referral)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      {referral.resumePath && (
                        <a
                          href={getAbsoluteResumePath(referral.resumePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 rounded border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 text-sm font-medium transition"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Resume
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;
