import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, Building, ExternalLink, ArrowLeft } from 'lucide-react';
import { Job } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  const fetchJob = async (jobId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data.job);
    } catch (err) {
      setError('Failed to fetch job details');
    } finally {
      setLoading(false);
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

  const handleApplyWithResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !job) return;
    setApplyLoading(true);
    setApplyError('');
    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('resume', e.target.files[0]);
      await api.post('/referrals/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Application submitted successfully!');
    } catch (err: any) {
      setApplyError('Failed to apply. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Job not found'}</p>
        <Button onClick={() => navigate('/jobs')} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Building className="h-5 w-5 mr-2" />
                <span className="text-lg font-medium">{job.company}</span>
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
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600 dark:text-slate-300">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">Application Deadline:</span>
              <span className="ml-2">{formatDate(job.deadline)}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-slate-300">
              <Building className="h-5 w-5 mr-2" />
              <span className="font-medium">Posted:</span>
              <span className="ml-2">{formatDate(job.createdAt)}</span>
            </div>
          </div>

          {job.url && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">External Application</h3>
              <Button asChild>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-foreground">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply on Company Website
                </a>
              </Button>
            </div>
          )}

          {user?.role === 'fresher' && job.isApproved && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Apply for this position</h3>
              <p className="text-gray-600 dark:text-slate-300 mb-4">
                Ready to apply? Click the button below to start your application.
              </p>
              <Button asChild size="lg">
                <Link to={`/jobs/${job._id}/apply`}>
                  Apply Now
                </Link>
              </Button>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleApplyWithResume}
                />
                <Button
                  variant="outline"
                  size="lg"
                  disabled={applyLoading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  {applyLoading ? 'Applying...' : 'Apply with Resume'}
                </Button>
                {applyError && <p className="text-red-600 mt-2">{applyError}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetail;
