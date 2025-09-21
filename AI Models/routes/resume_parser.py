from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.resume_parser_service import parse_resume

router = APIRouter()

@router.post("/parser")
async def resume_parser(file: UploadFile = File(...)):
    """
    Extract structured resume details such as name, email, skills, projects, etc.
    """
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or TXT files are supported.")

    try:
        result = await parse_resume(file)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {e}")
