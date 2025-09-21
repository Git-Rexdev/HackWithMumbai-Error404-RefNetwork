from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langgraph.graph import StateGraph, END, START
from typing import TypedDict
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import docx2txt
import fitz  
import tempfile
import os
import asyncio
from functools import lru_cache


load_dotenv()


app = FastAPI(title="Resume Analyzer API")


class EvaluationSchema(BaseModel):
    feedback: str = Field(description="Feedback for resume")
    score: int = Field(description="Score out of 100", ge=0, le=100)

class ResumeState(TypedDict):
    job_description: str
    resume: str
    score: int
    feedback: str

# # Optimized LLM configuration
# llm = ChatGoogleGenerativeAI(
#     model="gemini-1.5-flash",  
#     temperature=0.1,           
#     max_tokens=500,           
#     timeout=30,
#     api_key=os.getenv("GENAI_API_KEY")               
# )

llm = ChatOpenAI(model='gpt-4.1-mini-2025-04-14',temperature=0.5)
structured_llm = llm.with_structured_output(EvaluationSchema)


combined_prompt = PromptTemplate(
    input_variables=["job_description", "resume"],
    template=""" 
You are a resume evaluator. Analyze the following resume against the job description and provide BOTH a score and feedback.

Job Description:
{job_description}

Resume:
{resume}

Instructions:
1. Score: Rate from 0-100 how well the resume matches the job requirements
2. Feedback: give a 6 to 7 line Feedback to the the resume based on the Job Description, resume,score
"""
)


def evaluate_resume(state: ResumeState):
    """Single evaluation function that returns both score and feedback"""
    result = structured_llm.invoke(
        combined_prompt.format(
            job_description=state["job_description"], 
            resume=state["resume"]
        )
    )
    return {
        "score": result.score,
        "feedback": result.feedback
    }


graph = StateGraph(ResumeState)
graph.add_node("evaluate_resume", evaluate_resume)
graph.add_edge(START, "evaluate_resume")
graph.add_edge("evaluate_resume", END)
workflow = graph.compile()


def extract_text_from_pdf(file_path: str) -> str:
    """Optimized PDF text extraction"""
    text = ""
    try:
        with fitz.open(file_path) as doc:
            
            max_pages = min(3, len(doc))
            for page_num in range(max_pages):
                page = doc[page_num]
                text += page.get_text("text")
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting PDF text: {str(e)}")

def extract_text_from_docx(file_path: str) -> str:
    """Optimized DOCX text extraction"""
    try:
        text = docx2txt.process(file_path)
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting DOCX text: {str(e)}")

def extract_resume_text(file: UploadFile) -> str:
    """Optimized resume text extraction with better error handling"""
    if not file or not file.filename:
        raise ValueError("No file provided")
    
   
    if hasattr(file, 'size') and file.size > 10 * 1024 * 1024:
        raise ValueError("File too large. Please upload files smaller than 10MB.")
    
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = file.file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        
        file.file.seek(0)
        
        
        if file_ext == ".pdf":
            text = extract_text_from_pdf(tmp_path)
        elif file_ext in [".doc", ".docx"]:
            text = extract_text_from_docx(tmp_path)
        else:
            raise ValueError("Unsupported file type. Please upload PDF or DOCX files only.")
        
        
        try:
            os.unlink(tmp_path)
        except:
            pass  
            
        
        if not text or len(text.strip()) < 50:
            raise ValueError("Unable to extract sufficient text from the file. Please check the file format.")
            
        return text
        
    except Exception as e:
       
        try:
            if 'tmp_path' in locals():
                os.unlink(tmp_path)
        except:
            pass
        raise e


@app.post("/analyze_resume")
async def analyze_resume(
    job_description: str = Form(..., max_length=5000),  # Limit input size
    resume_file: UploadFile = None
):
    """Optimized resume analysis endpoint"""
    
   
    if not job_description.strip():
        return JSONResponse(
            content={"error": "Job description is required"}, 
            status_code=400
        )
    
    if not resume_file:
        return JSONResponse(
            content={"error": "Resume file is required"}, 
            status_code=400
        )
    
    try:
        
        resume_text = extract_resume_text(resume_file)
        
        
        max_resume_length = 3000
        max_jd_length = 2000
        
        if len(resume_text) > max_resume_length:
            resume_text = resume_text[:max_resume_length] + "..."
            
        if len(job_description) > max_jd_length:
            job_description = job_description[:max_jd_length] + "..."
        
       
        result = workflow.invoke({
            "job_description": job_description.strip(), 
            "resume": resume_text
        })
        
        return JSONResponse(content={
            "score": result["score"],
            "feedback": result["feedback"],
            "status": "success"
        })
        
    except ValueError as ve:
        return JSONResponse(
            content={"error": str(ve)}, 
            status_code=400
        )
    except Exception as e:
        return JSONResponse(
            content={"error": f"Processing error: {str(e)}"}, 
            status_code=500
        )


