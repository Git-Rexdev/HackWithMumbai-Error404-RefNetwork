import axios from 'axios';

const AI_API_BASE_URL = 'https://refnetwork-146032458078.europe-west1.run.app';

const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI Models API functions
export const aiApiService = {
  // Keyword Analyzer - Analyze job description and resume matching
  analyzeKeywords: async (jdText: string, resumeText: string) => {
    const response = await aiApi.post('/refnet/keyword_analyzer', null, {
      params: {
        jd_text: jdText,
        resume_text: resumeText,
      },
    });
    return response.data;
  },

  // Resume Parser - Extract structured resume details
  parseResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await aiApi.post('/refnet/parser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Resume Analyzer - Optimized resume analysis
  analyzeResume: async (jobDescription: string, resumeFile: File) => {
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    formData.append('resume_file', resumeFile);
    try {
      const response = await aiApi.post('/refnet/resume_analyzer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Resume Analyzer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resume Analyzer error:', error);
      throw error;
    }
  },

  // Roadmap Creator - Create domain-specific roadmaps
  createRoadmap: async (domain: string) => {
    const response = await aiApi.post('/refnet/roadmap_creator', null, {
      params: {
        domain: domain,
      },
    });
    return response.data;
  },

  // Chat API - AI Chatbot
  sendMessage: async (message: string, sessionId: string = 'default') => {
    const response = await aiApi.post('/refnet/chat', {
      message: message,
      session_id: sessionId,
    });
    return response.data;
  },

  // Get conversation history
  getChatHistory: async (sessionId: string) => {
    const response = await aiApi.get(`/refnet/chat/${sessionId}/history`);
    return response.data;
  },

  // Clear conversation
  clearConversation: async (sessionId: string) => {
    const response = await aiApi.delete(`/refnet/chat/${sessionId}`);
    return response.data;
  },

  // Get API stats
  getStats: async () => {
    const response = await aiApi.get('/refnet/stats');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await aiApi.get('/health');
    return response.data;
  },
};

export default aiApi;
