from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.route_keyword_analyzer import router as keyword_analyzer
from routes.route_roadmap_creator import router as roadmap_creator
from routes.resume_parser import router as resume_parser
from routes.route_analyzer_service import router as resume_analyzer
from routes.routes_chatbot import router as chatbot


app = FastAPI(
    title="RefNetwork Unified API",
    version="1.0.0",
    description="AI powered Parser, Keyword Analyzer, Roadmap Creator, Resume Analyzer "
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(keyword_analyzer, prefix="/refnet", tags=["Keyword Analyzer"])
app.include_router(roadmap_creator, prefix="/refnet", tags=["Roadmap Creator"])
app.include_router(resume_parser, prefix="/refnet", tags=["Resume Parser"])
app.include_router(resume_analyzer, prefix="/refnet", tags=["Resume Analyzer"])
app.include_router(chatbot,prefix='/refnet',tags=["Chatbot"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
