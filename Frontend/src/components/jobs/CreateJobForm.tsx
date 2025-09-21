import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, X } from 'lucide-react';
import api from '../../lib/api';
import { CreateJobData } from '../../types';
import FadeIn from '../animations/FadeIn';

const CreateJobForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobData>();

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = async (data: CreateJobData) => {
    if (skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const jobData = {
        ...data,
        skills,
        deadline: new Date(data.deadline).toISOString(),
      };

      await api.post('/jobs', jobData);
      navigate('/my-jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FadeIn direction="up" delay={100}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Job Posting</CardTitle>
            <CardDescription>
              Post a new job opportunity for freshers to apply
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <FadeIn direction="up" delay={200}>
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                </FadeIn>
              )}

              <FadeIn direction="up" delay={300}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      {...register('title', { 
                        required: 'Job title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters'
                        }
                      })}
                      placeholder="e.g., Frontend Developer"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      {...register('company', { 
                        required: 'Company name is required',
                        minLength: {
                          value: 2,
                          message: 'Company name must be at least 2 characters'
                        }
                      })}
                      placeholder="e.g., Tech Corp"
                    />
                    {errors.company && (
                      <p className="text-sm text-red-600">{errors.company.message}</p>
                    )}
                  </div>
                </div>
              </FadeIn>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                {...register('description', { 
                  required: 'Job description is required',
                  minLength: {
                    value: 50,
                    message: 'Description must be at least 50 characters'
                  }
                })}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="e.g., Mumbai, India"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  {...register('deadline', { 
                    required: 'Deadline is required',
                    validate: (value) => {
                      const deadline = new Date(value);
                      const now = new Date();
                      return deadline > now || 'Deadline must be in the future';
                    }
                  })}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">External Application URL</Label>
              <Input
                id="url"
                type="url"
                {...register('url', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL starting with http:// or https://'
                  }
                })}
                placeholder="https://company.com/careers/apply"
              />
              {errors.url && (
                <p className="text-sm text-red-600">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Required Skills *</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-primary-foreground"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length === 0 && (
                <p className="text-sm text-red-600">Please add at least one skill</p>
              )}
            </div>

            <FadeIn direction="up" delay={800}>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-jobs')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || skills.length === 0}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Job...' : 'Create Job'}
                </Button>
              </div>
            </FadeIn>
          </form>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
};

export default CreateJobForm;
