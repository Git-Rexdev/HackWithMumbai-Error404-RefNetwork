import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Building, MapPin, Calendar, User } from 'lucide-react';
import { Job } from '../../types';
import api from '../../lib/api';

const PendingApprovals: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/referrals/jobs/unapproved');
      const pendingJobs = response.data.jobs || [];
      setJobs(pendingJobs);
    } catch (err) {
      setError('Failed to fetch pending jobs');
    } finally {
      setLoading(false);
    }
  };

  const approveJob = async (jobId: string) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      console.error('Failed to approve job:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
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
        <Button onClick={fetchPendingJobs} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
  <h1 className="text-3xl font-bold text-primary">Pending Approvals</h1>
        <p className="mt-2 text-gray-600">
          Review and approve job postings from employees
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              No pending job approvals at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                      {job.location && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </Badge>
                    {isDeadlineNear(job.deadline) && (
                      <Badge className="bg-red-100 text-red-800">
                        Deadline Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Job Description</h4>
                    <p className="text-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-primary mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} className="bg-background text-foreground border border-gray-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span className="font-medium">Application Deadline:</span>
                      <span className="ml-2">{formatDate(job.deadline)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">Posted:</span>
                      <span className="ml-2">{formatDate(job.createdAt)}</span>
                    </div>
                  </div>

                  {job.url && (
                    <div>
                      <h4 className="font-medium text-primary mb-2">External Application</h4>
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                      >
                        {job.url}
                      </a>
                    </div>
                  )}

                  <div className="flex space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => approveJob(job._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Job
                    </Button>
                    <Button className="border border-gray-300 bg-white hover:bg-gray-50" asChild>
                      <a href={`/jobs/${job._id}`} target="_blank" rel="noopener noreferrer">
                        View Full Details
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
