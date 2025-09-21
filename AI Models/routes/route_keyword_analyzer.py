from fastapi import APIRouter,HTTPException
from fastapi.responses import JSONResponse
from sklearn.metrics.pairwise import cosine_similarity
from services.keywordana import *
import json

router = APIRouter()

@router.post("/keyword_analyzer")
async def keyword_analyzer(jd_text,resume_text):
    """
    Analyze the keywords in Job Description and Resume and gives matching score
    """
    try:
        result = pipeline.fit_transform([resume_text,jd_text])
        similarity_score = cosine_similarity(result[0:1], result[1:2])[0][0]
        score_percent = round(similarity_score * 100, 2)
        preprocessor = SpacyPreprocessor()
        processed_texts = preprocessor.transform([jd_text, resume_text])
        jd_keywords = set(processed_texts[0].split())
        resume_keywords = set(processed_texts[1].split())

        matching_keywords = sorted(list(jd_keywords.intersection(resume_keywords)))
        missing_keywords = sorted(list(jd_keywords.difference(resume_keywords)))

        # --- Response ---
        json_output = {
            "Resume Match Score": score_percent,
            "Matching Keywords": matching_keywords,
        }
        # json_output = {"Resume Match Score": score_percent}
        return JSONResponse(content=json_output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while analyzing : {e}")
