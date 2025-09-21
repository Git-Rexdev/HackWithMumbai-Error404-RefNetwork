import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { FileText, Upload, BarChart3, TrendingUp, AlertCircle, CheckCircle, Loader2, Target, Star } from 'lucide-react';
import { aiApiService } from '../../lib/aiApi';

interface AnalysisResult {
  overall_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  keyword_matches?: string[];
  missing_keywords?: string[];
  sections_analysis?: {
    contact_info?: { score: number; feedback: string };
    summary?: { score: number; feedback: string };
    experience?: { score: number; feedback: string };
    skills?: { score: number; feedback: string };
    education?: { score: number; feedback: string };
  };
  ats_compatibility?: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  formatting_score?: number;
  content_score?: number;
  keyword_score?: number;
  feedback?: string;
}

const ResumeAnalyzer: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setResumeFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resumeFile) {
      setError('Please provide both job description and resume file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await aiApiService.analyzeResume(jobDescription, resumeFile);
      setResult(response);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error analyzing resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get comprehensive analysis and optimization suggestions for your resume 
          tailored to specific job descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Description Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Target Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="job-description">Paste the job description you're applying for</Label>
              <Textarea
                id="job-description"
                placeholder="Enter the complete job description including requirements, responsibilities, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-sm text-gray-500">
                {jobDescription.length} characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Upload Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">
                    {resumeFile ? resumeFile.name : 'Choose your resume file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
              </div>

              {resumeFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{resumeFile.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-8">
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !jobDescription.trim() || !resumeFile}
          size="lg"
          className="px-8 py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5 mr-2" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* If result is not in expected format, show raw JSON for debugging */}
          {(!result.overall_score && !result.strengths && !result.weaknesses) && (
            <Card className="bg-white dark:bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4">
                  <div className="text-lg text-black dark:text-white p-4 rounded-lg bg-white dark:bg-black border border-gray-300 dark:border-gray-700 whitespace-pre-wrap break-words">
                    {result.feedback || 'No feedback available.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* ...existing code... */}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
