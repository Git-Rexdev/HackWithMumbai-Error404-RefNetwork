import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Brain, 
  FileText, 
  Search, 
  Map, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIModelsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const aiModels = [
    {
      id: 'keyword-analyzer',
      title: 'Keyword Analyzer',
      description: 'Analyze job descriptions and resumes to find matching keywords and calculate compatibility scores.',
      icon: Search,
      color: 'bg-blue-500',
      path: '/ai/keyword-analyzer',
      features: ['Job-Resume Matching', 'Keyword Analysis', 'Compatibility Score']
    },
    {
      id: 'resume-parser',
      title: 'Resume Parser',
      description: 'Extract structured information from resumes including skills, experience, and contact details.',
      icon: FileText,
      color: 'bg-green-500',
      path: '/ai/resume-parser',
      features: ['Data Extraction', 'Structured Output', 'Contact Details']
    },
    {
      id: 'resume-analyzer',
      title: 'Resume Analyzer',
      description: 'Get comprehensive analysis and optimization suggestions for your resume.',
      icon: BarChart3,
      color: 'bg-purple-500',
      path: '/ai/resume-analyzer',
      features: ['Resume Optimization', 'Analysis Report', 'Improvement Tips']
    },
    {
      id: 'roadmap-creator',
      title: 'Roadmap Creator',
      description: 'Generate personalized learning roadmaps for any domain or technology.',
      icon: Map,
      color: 'bg-orange-500',
      path: '/ai/roadmap-creator',
      features: ['Learning Paths', 'Skill Development', 'Career Guidance']
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">AI Models Hub</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Leverage the power of AI to enhance your career journey. Choose from our suite of intelligent tools 
          designed to help you succeed in your professional endeavors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {aiModels.map((model) => {
          const IconComponent = model.icon;
          return (
            <Card 
              key={model.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(model.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${model.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {model.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {model.description}
                </p>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex w-full mt-8">
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                    variant="outline"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Start Guide */}
  <Card className="bg-gray-50 dark:bg-black">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Choose Your Tool</h3>
              <p className="text-sm text-gray-600">Select the AI model that best fits your needs</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Upload Data</h3>
              <p className="text-sm text-gray-600">Provide the required documents or information</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">Our AI analyzes and processes your data</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">Receive detailed insights and recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIModelsDashboard;
