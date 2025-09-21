import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, Building, ExternalLink } from 'lucide-react';
import { Job } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ApplyJobForm from './ApplyJobForm';

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [openApplyModal, setOpenApplyModal] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      setJobs(response.data.jobs || []);
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
        <Button onClick={fetchJobs} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gray-50 dark:bg-black -m-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Jobs</h1>
        <div className="text-sm text-gray-600 dark:text-slate-300">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No jobs available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for new opportunities.
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
                    <Badge variant={job.isApproved ? "default" : "secondary"}>
                      {job.isApproved ? 'Approved' : 'Pending'}
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
                <p className="text-gray-700 dark:text-slate-200 mb-4 line-clamp-3">
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
                    {job.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Apply Externally
                        </a>
                      </Button>
                    )}
                    {user && job.isApproved && (
                      <Button variant="outline" size="sm" onClick={() => setOpenApplyModal(job._id)}>
                        Apply Directly
                      </Button>
                    )}
                    <Button asChild>
                      <Link to={`/jobs/${job._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
                {openApplyModal === job._id && (
                  <ApplyJobForm job={job} onClose={() => setOpenApplyModal(null)} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
