from fastapi import APIRouter,HTTPException,UploadFile,Form
from fastapi.responses import JSONResponse
from sklearn.metrics.pairwise import cosine_similarity
from services.resume_analyser_service import *
import json

router = APIRouter()

@router.post("/resume_analyzer")
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


