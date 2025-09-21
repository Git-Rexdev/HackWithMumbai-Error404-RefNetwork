from fastapi import APIRouter,HTTPException
from fastapi.responses import JSONResponse
from services.roadmap import chain
import pydantic
import json

router = APIRouter()

@router.post("/roadmap_creator")
async def roadmap_creator(domain:str):
    """
    Analyze the keywords in Job Description and Resume and gives matching score
    """
    try:
        result = chain.invoke({"domain":domain})
        return JSONResponse(content=result.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while creating roadmap : {e}")
