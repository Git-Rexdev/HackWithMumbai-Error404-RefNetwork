import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Search, FileText, TrendingUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { aiApiService } from '../../lib/aiApi';

interface AnalysisResult {
  matching_score?: number;
  matched_keywords?: string[];
  missing_keywords?: string[];
  suggestions?: string[];
  analysis?: {
    jd_keywords: string[];
    resume_keywords: string[];
    common_keywords: string[];
    jd_unique: string[];
    resume_unique: string[];
  };
  [key: string]: any;
}

const KeywordAnalyzer: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jdText.trim() || !resumeText.trim()) {
      setError('Please provide both job description and resume text');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await aiApiService.analyzeKeywords(jdText, resumeText);
      setResult(response);
    } catch (err) {
      setError('Failed to analyze keywords. Please try again.');
      console.error('Error analyzing keywords:', err);
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
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Search className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Keyword Analyzer</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Analyze the compatibility between job descriptions and resumes by identifying matching keywords 
          and calculating compatibility scores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Description Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="jd-text">Paste the job description here</Label>
              <Textarea
                id="jd-text"
                placeholder="Enter the complete job description including requirements, responsibilities, and qualifications..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-sm text-gray-500">
                {jdText.length} characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resume Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-500" />
              Resume Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="resume-text">Paste your resume content here</Label>
              <Textarea
                id="resume-text"
                placeholder="Enter your resume content including skills, experience, education, and achievements..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-sm text-gray-500">
                {resumeText.length} characters
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-8">
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !jdText.trim() || !resumeText.trim()}
          size="lg"
          className="px-8 py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Analyze Keywords
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
        <>
          <div className="space-y-6">
            {/* Overall Score */}
            {result.matching_score !== undefined && (
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Compatibility Score</h3>
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-200 mb-4">
                      <div className={`text-4xl font-bold ${getScoreColor(result.matching_score)}`}>
                        {result.matching_score}%
                      </div>
                    </div>
                    <p className={`text-lg font-semibold ${getScoreColor(result.matching_score)}`}>
                      {getScoreLabel(result.matching_score)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis */}
            {result.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Keywords */}
                {result.analysis.common_keywords && result.analysis.common_keywords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Matched Keywords ({result.analysis.common_keywords.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.common_keywords.map((keyword, index) => (
                          <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Keywords */}
                {result.analysis.jd_unique && result.analysis.jd_unique.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Missing Keywords ({result.analysis.jd_unique.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.jd_unique.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="border-red-200 text-red-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Raw Analysis Data */}
            {result.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-blue-600">Job Description Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.analysis.jd_keywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Resume Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.analysis.resume_keywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Raw Response Data */}
          <Card className="bg-white dark:bg-black border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Resume Match Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-black dark:text-white p-4 rounded-lg bg-white dark:bg-black border border-gray-700 text-center">
                {result["Resume Match Score"] !== undefined
                  ? `${result["Resume Match Score"]}%`
                  : 'No score available.'}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default KeywordAnalyzer;
