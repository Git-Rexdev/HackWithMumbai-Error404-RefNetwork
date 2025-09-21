import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { FileText, Upload, Download, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Loader2, AlertCircle } from 'lucide-react';
import { aiApiService } from '../../lib/aiApi';

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
  }>;
  certifications?: string[];
  languages?: string[];
  summary?: string;
}

const ResumeParser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParsedResume | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
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

      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Please select a file to parse');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await aiApiService.parseResume(file);
      setResult(response);
    } catch (err: any) {
      // Try to extract backend error message
      let errorMsg = 'Failed to parse resume. Please try again.';
      if (err && err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setError(errorMsg);
      console.error('Error parsing resume:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'parsed_resume.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileText className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Resume Parser</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract structured information from your resume including contact details, skills, 
          experience, education, and more using AI-powered parsing.
        </p>
      </div>

      {/* File Upload Section */}
  <Card className="mb-8 bg-white dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-blue-500" />
            Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">
                  {file ? file.name : 'Choose a resume file'}
                </p>
                <p className="text-gray-500">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  onClick={handleParse}
                  disabled={isLoading}
                  className="ml-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Parse Resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
          {/* Header with Download Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Parsed Resume Data</h2>
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>

          {/* Contact Information */}
          {(result.name || result.email || result.phone || result.location) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.name && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{result.name}</span>
                    </div>
                  )}
                  {result.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{result.email}</span>
                    </div>
                  )}
                  {result.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{result.phone}</span>
                    </div>
                  )}
                  {result.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{result.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {result.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {result.skills && result.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-500" />
                  Skills ({result.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {result.experience && (
            Array.isArray(result.experience) && result.experience.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
                    Work Experience ({result.experience.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="font-semibold text-lg">{exp.title}</h4>
                          <span className="text-sm text-gray-500">{exp.duration}</span>
                        </div>
                        <p className="font-medium text-gray-700 mb-1">{exp.company}</p>
                        {exp.description && (
                          <p className="text-gray-600 text-sm">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (typeof result.experience === 'string' && result.experience && (result.experience as string).trim() !== '') ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{result.experience as string}</p>
                </CardContent>
              </Card>
            ) : null
          )}

          {/* Education */}
          {result.education && result.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-orange-500" />
                  Education ({result.education.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.education.map((edu, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      {edu.year && (
                        <span className="text-sm text-gray-500">{edu.year}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {result.projects && result.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Projects ({result.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.projects.map((project, index) => {
                    // Handle if project is a string or empty object
                    if (typeof project === 'string') {
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{project}</h4>
                        </div>
                      );
                    }
                    if (!project || (!project.name && !project.description && (!project.technologies || project.technologies.length === 0))) {
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-2 text-gray-400">No project data</h4>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{project.name || 'Untitled Project'}</h4>
                        {project.description && (
                          <p className="text-gray-600 mb-2">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {result.certifications && result.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications ({result.certifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center">
                      <Award className="h-4 w-4 text-yellow-500 mr-2" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {result.languages && result.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages ({result.languages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.languages.map((language, index) => (
                    <Badge key={index} variant="secondary">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeParser;
