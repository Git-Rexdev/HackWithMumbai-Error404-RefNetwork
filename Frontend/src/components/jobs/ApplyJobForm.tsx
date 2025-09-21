import React, { useRef, useState } from 'react';
import { Job } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import api from '../../lib/api';

interface ApplyJobFormProps {
  job: Job;
  onClose: () => void;
}

const ApplyJobForm: React.FC<ApplyJobFormProps> = ({ job, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    whyBetter: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setResumeFile(e.target.files[0]);
    setResumeName(e.target.files[0].name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setApplyError('Please upload your resume.');
      return;
    }
    if (!form.fullName || !form.whyBetter) {
      setApplyError('Please fill all required fields.');
      return;
    }
    setApplyLoading(true);
    setApplyError('');
    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('fullName', form.fullName);
      formData.append('coverLetter', form.coverLetter);
      formData.append('whyBetter', form.whyBetter);
      formData.append('resume', resumeFile);
      await api.post('/referrals/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Application submitted successfully!');
      onClose();
    } catch (err: any) {
      setApplyError('Failed to apply. Please try again.');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-primary">Apply for {job.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-primary">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-primary">Cover Letter</label>
              <textarea
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-primary">Why are you a better fit?</label>
              <textarea
                name="whyBetter"
                value={form.whyBetter}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground"
                rows={2}
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleResumeChange}
              />
              <Button
                variant="outline"
                size="lg"
                disabled={applyLoading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-2 bg-background text-foreground border"
                type="button"
              >
                {resumeName ? `Selected: ${resumeName}` : 'Upload Resume'}
              </Button>
              {applyError && <p className="text-red-600 mt-2">{applyError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={applyLoading}>
                {applyLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyJobForm;
