from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from typing import List, Dict, Optional
import re
import time
from functools import lru_cache
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client lazily to avoid startup errors
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    return OpenAI(api_key=api_key)

MAX_CONVERSATION_HISTORY = 16    
MAX_RESPONSE_TOKENS = 300          
AI_TEMPERATURE = 0.7             
MODERATION_MODEL = "gpt-4o-mini" 
ADVICE_MODEL = "gpt-4o-mini"     
CACHE_SIZE = 100

app = FastAPI(
    title="Professional API",
    description="AI-powered professional development assistant",
    version="1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schemas
class Message(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    success: bool
    message: str
    response_type: str
    session_id: str
    timestamp: float
    suggestions: Optional[List[str]] = None

# Store conversations by session
conversations: Dict[str, List[dict]] = {}

# Professional greeting response
GREETING_RESPONSE = {
    "message": """Hello! I'm your AI Career Advisor. I'm here to help you navigate your professional journey with personalized guidance and industry insights.

I can assist you with:
• Resume and LinkedIn profile optimization
• Interview preparation and strategies
• Career transition planning
• Salary negotiation tactics
• Professional skill development
• Industry trends and job market analysis
• Networking strategies
• Work-life balance optimization

What specific career challenge can I help you tackle today?""",
    "suggestions": [
        "Help me improve my resume",
        "Prepare for an upcoming interview",
        "Negotiate a better salary",
        "Plan a career transition",
        "Develop new professional skills"
    ]
}

# Quick response patterns for efficiency
QUICK_PATTERNS = {
    'greeting': [
        r'\b(hi|hello|hey|good morning|good afternoon|good evening)\b',
        r'^(hi|hello|hey)$'
    ],
    'thanks': [
        r'\b(thank you|thanks|appreciate)\b'
    ],
    'goodbye': [
        r'\b(bye|goodbye|see you|farewell)\b'
    ]
}

# Career-related keywords for fast filtering
CAREER_KEYWORDS = {
    'job', 'career', 'work', 'resume', 'interview', 'salary', 'promotion',
    'skills', 'experience', 'linkedin', 'networking', 'professional',
    'company', 'employer', 'hiring', 'application', 'cv', 'cover letter',
    'workplace', 'industry', 'position', 'role', 'employment', 'business',
    'manager', 'leadership', 'team', 'project', 'development', 'growth',
    # Additional words
    'recruiter', 'headhunter', 'opportunity', 'vacancy', 'opening',
    'training', 'certification', 'portfolio', 'references', 'onboarding',
    'probation', 'evaluation', 'feedback', 'performance', 'mentorship',
    'promotion', 'retirement', 'internship', 'freelance', 'contract',
    'full-time', 'part-time', 'network', 'negotiation', 'benefits',
    'work-life', 'entrepreneur', 'startup', 'organization', 'HR',
    'talent', 'candidate', 'selection', 'job fair', 'career path',
    'job board', 'headhunting', 'placement', 'recruitment', 'outsourcing'
}

def check_pattern(message: str, patterns: List[str]) -> bool:
    """Check if message matches any of the given patterns"""
    message_lower = message.lower().strip()
    for pattern in patterns:
        if re.search(pattern, message_lower):
            return True
    return False

def is_career_related_fast(message: str) -> bool:
    """Fast career relevance check using keywords"""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CAREER_KEYWORDS)

def moderate_content_ai(text: str) -> bool:
    """AI-based content moderation with caching"""
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=MODERATION_MODEL,
            messages=[
                {"role": "system", "content": "You are a content moderator. Respond only with 'YES' if the message is inappropriate for professional career coaching, or 'NO' if it's appropriate."},
                {"role": "user", "content": text}
            ],
            max_tokens=10,
            temperature=0
        )
        return response.choices[0].message.content.strip().upper() == "YES"
    except:
        return False  # Default to allowing if API fails

def generate_career_response(conversation_history: List[dict]) -> str:
    """Generate career advice using OpenAI"""
    system_prompt = """You are a Senior Career Advisor and Executive Coach with 15+ years of experience. You provide strategic, actionable career guidance.

Your expertise includes:
- Resume optimization and ATS compatibility
- Interview coaching (behavioral, technical, executive)
- Career transition strategies
- Salary negotiation and compensation analysis
- Leadership development and executive presence
- Personal branding and LinkedIn optimization
- Industry insights and market trends
- Networking and relationship building
- Work-life integration strategies

Communication style:
- Professional yet approachable
- Provide specific, actionable advice
- Use industry insights and real examples
- Ask clarifying questions when needed
- Offer structured solutions with clear next steps
- Keep responses concise but comprehensive (200-400 words max)

Always maintain confidentiality and provide personalized advice."""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)

    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model=ADVICE_MODEL,
            messages=messages,
            max_tokens=MAX_RESPONSE_TOKENS,
            temperature=AI_TEMPERATURE,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

def get_career_suggestions(user_message: str) -> List[str]:
    """Generate relevant follow-up suggestions based on user message"""
    suggestions_map = {
        'resume': [
            "How to make my resume ATS-friendly?",
            "What keywords should I include?",
            "How to quantify my achievements?"
        ],
        'interview': [
            "Common behavioral interview questions",
            "How to research a company before interview?",
            "What questions should I ask the interviewer?"
        ],
        'salary': [
            "How to research market salary rates?",
            "When is the right time to negotiate?",
            "What benefits should I consider?"
        ],
        'career': [
            "How to plan a career transition?",
            "What skills are in demand?",
            "How to build a professional network?"
        ]
    }
    
    message_lower = user_message.lower()
    for key, suggestions in suggestions_map.items():
        if key in message_lower:
            return suggestions
    
    # Default suggestions
    return [
        "Tell me about current job market trends",
        "How can I improve my LinkedIn profile?",
        "What are the most valuable skills to develop?"
    ]

