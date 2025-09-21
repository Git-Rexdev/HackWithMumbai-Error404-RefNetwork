import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, Building, Edit, Eye, Plus } from 'lucide-react';
import { Job } from '../../types';
import api from '../../lib/api';
import FadeIn from '../animations/FadeIn';

const MyJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchMyJobs();
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      const allJobs = response.data.jobs || [];
      // Only show jobs created by the logged-in employee
      if (user && user.role === 'employee') {
  setJobs(allJobs.filter((job: Job) => job.createdBy === user._id));
      } else {
        setJobs(allJobs);
      }
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        <Button onClick={fetchMyJobs} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gray-50 dark:bg-black -m-6 p-6">
      <FadeIn direction="up" delay={100}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Job Postings</h1>
            <p className="mt-2 text-gray-600 dark:text-slate-300">
              Manage your job postings and track applications
            </p>
          </div>
          <Button asChild>
          <Link to="/create-job">
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Link>
        </Button>
        </div>
      </FadeIn>

      {jobs.length === 0 ? (
        <FadeIn direction="up" delay={300}>
          <Card>
            <CardContent className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first job posting.
              </p>
              <Button asChild className="mt-4">
                <Link to="/create-job">Create Job</Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, index) => (
            <FadeIn key={job._id} direction="up" delay={300 + index * 100}>
              <Card className="hover:shadow-md transition-shadow">
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
                    <Badge variant={job.isApproved ? "default" : "secondary"}>
                      {job.isApproved ? 'Approved' : 'Pending Approval'}
                    </Badge>
                    {isDeadlineNear(job.deadline) && (
                      <Badge variant="destructive">
                        Deadline Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {job.description}
                </p>
                
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {formatDate(job.deadline)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/jobs/${job._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/referrals?jobId=${job._id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Manage Referrals
                      </Link>
                    </Button>
                  </div>
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

export default MyJobs;
