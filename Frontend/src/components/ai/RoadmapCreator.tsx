import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Map, Search, BookOpen, Clock, Star, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { aiApiService } from '../../lib/aiApi';

interface RoadmapStep {
  title?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  resources?: string[];
  prerequisites?: string[];
  skills_learned?: string[];
  concept?: string;
}

interface RoadmapResult {
  domain?: string;
  total_duration?: string;
  difficulty_level?: string;
  overview?: string;
  steps?: RoadmapStep[];
  prerequisites?: string[];
  career_opportunities?: string[];
  next_steps?: string[];
  raw?: any;
}

const RoadmapCreator: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [error, setError] = useState('');

  const popularDomains = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design',
    'Digital Marketing',
    'Project Management',
    'Blockchain',
    'Artificial Intelligence',
    'Full Stack Development',
    'Backend Development',
    'Frontend Development'
  ];

  const handleCreateRoadmap = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain or technology');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await aiApiService.createRoadmap(domain);
      console.log('Roadmap API response:', response);
      // Show raw response for debugging if no steps found
      if (response && response.steps && Array.isArray(response.steps)) {
        setResult(response);
      } else if (response && response.roadmap && response.roadmap.steps && Array.isArray(response.roadmap.steps)) {
        setResult(response.roadmap);
      } else if (response && response.data && response.data.steps && Array.isArray(response.data.steps)) {
        setResult(response.data);
      } else {
        setResult({ overview: 'Raw response', steps: [], domain, raw: response });
        setError('Roadmap data not found in response.');
        console.error('Unexpected roadmap response structure:', response);
      }
    } catch (err) {
      setError('Failed to create roadmap. Please try again.');
      console.error('Error creating roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainSelect = (selectedDomain: string) => {
    setDomain(selectedDomain);
    setError('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Stats Section - Improved for Dark UI */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Map className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Roadmap Creator</h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Generate personalized learning roadmaps for any domain or technology. 
          Get step-by-step guidance to master new skills and advance your career.
        </p>
        {/* Example stats bar for dark mode fix */}
  <div className="flex justify-center gap-8 mt-6 bg-gray-100 dark:bg-black rounded-xl py-6 shadow-md dark:border-2 dark:border-blue-500">
          <div className="flex flex-col items-center">
            <span className="text-blue-500 dark:text-blue-400 text-3xl font-bold">5</span>
            <span className="text-gray-700 dark:text-gray-200 text-sm mt-1">AI Models</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-600 dark:text-green-400 text-3xl font-bold">99%</span>
            <span className="text-gray-700 dark:text-gray-200 text-sm mt-1">Accuracy Rate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-purple-600 dark:text-purple-400 text-3xl font-bold">24/7</span>
            <span className="text-gray-700 dark:text-gray-200 text-sm mt-1">Available</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
  <Card className="mb-8 bg-white dark:bg-black border dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-500" />
            Choose Your Learning Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="domain-input">Enter a domain or technology</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="domain-input"
                  placeholder="e.g., Machine Learning, Web Development, Data Science..."
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCreateRoadmap}
                  disabled={isLoading || !domain.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Map className="h-4 w-4 mr-2" />
                      Create Roadmap
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Popular Domains */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Or choose from popular domains:
              </Label>
              <div className="flex flex-wrap gap-2">
                {popularDomains.map((popularDomain) => (
                  <Button
                    key={popularDomain}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDomainSelect(popularDomain)}
                    className={`${
                      domain === popularDomain 
                        ? 'bg-primary text-white border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {popularDomain}
                  </Button>
                ))}
              </div>
            </div>
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
          {/* Roadmap Header */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {result.domain} Learning Roadmap
                </h2>
                {result.overview && (
                  <p className="text-lg text-gray-600 mb-4 max-w-3xl mx-auto">
                    {result.overview}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  {result.total_duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="font-medium">Duration: {result.total_duration}</span>
                    </div>
                  )}
                  {result.difficulty_level && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="font-medium">Level: {result.difficulty_level}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {result.prerequisites && result.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-500" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Steps */}
          {result.steps && result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
                  Learning Path ({result.steps.length} Steps)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.steps.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Step Number and Line */}
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white dark:bg-black border rounded-lg p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {step.title && step.title.trim() !== '' ? step.title : `Step ${index + 1}`}
                              </h3>
                            </div>
                            <p className="mb-4 text-black dark:text-white">
                              {step.concept && step.concept.trim() !== ''
                                ? step.concept
                                : (step.description && step.description.trim() !== ''
                                  ? step.description
                                  : 'No description available for this step.')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                        {/* Connecting Line */}
                        {result.steps && index < result.steps.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-300"></div>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Opportunities */}
          {result.career_opportunities && result.career_opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-green-500" />
                  Career Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.career_opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{opportunity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {result.next_steps && result.next_steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapCreator;
