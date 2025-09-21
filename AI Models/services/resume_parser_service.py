import os
import asyncio
import aiofiles
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import pdfplumber
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, EmailStr
from typing import Optional, List

load_dotenv()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",  
    temperature=0.1,
    api_key=os.getenv("GENAI_API_KEY"),
    
    max_output_tokens=2048,  
    max_retries=2,  
    request_timeout=30,  
)

class ResumeInfo(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    skills: List[str]
    experience: str
    certifications: List[str]
    achievements: Optional[List[str]]
    projects: List[str]


@lru_cache(maxsize=1)
def get_parser_and_prompt():
    parser = PydanticOutputParser(pydantic_object=ResumeInfo)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert resume analyzer. Extract structured information efficiently and concisely."),
        ("human", "Extract info from resume (be concise):\n\n{text}\n\n{format_instructions}")
    ])
    return parser, prompt


executor = ThreadPoolExecutor(max_workers=2)

def extract_pdf_text_sync(file_path: str) -> str:
    """Synchronous PDF text extraction"""
    content = []
    with pdfplumber.open(file_path) as pdf:
        
        pages_to_process = min(len(pdf.pages), 3)
        for i in range(pages_to_process):
            text = pdf.pages[i].extract_text()
            if text:
                content.append(text)
    return "\n".join(content)

async def extract_pdf_text_async(file_path: str) -> str:
    """Asynchronous PDF text extraction using thread pool"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, extract_pdf_text_sync, file_path)

def truncate_text(text: str, max_chars: int = 4000) -> str:
    """Truncate text to reduce processing time while keeping important info"""
    if len(text) <= max_chars:
        return text
    
   
    truncated = text[:max_chars]
    last_period = truncated.rfind('.')
    last_newline = truncated.rfind('\n')
    
    cut_point = max(last_period, last_newline)
    if cut_point > max_chars * 0.8:  
        return truncated[:cut_point + 1]
    else:
        return truncated + "..."

async def save_file_async(file, file_path: str) -> None:
    """Asynchronously save uploaded file"""
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)

async def read_text_file_async(file_path: str) -> str:
    """Asynchronously read text file"""
    async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
        return await f.read()

async def parse_resume(file):
    """
    Extract structured information from a resume file using Gemini (optimized version).
    """
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    
    await save_file_async(file, file_path)
    
    try:
       
        if file.filename.lower().endswith(".pdf"):
            
            resume_text = await extract_pdf_text_async(file_path)
        else:
           
            resume_text = await read_text_file_async(file_path)
        
        
        resume_text = truncate_text(resume_text)
        
        
        parser, prompt = get_parser_and_prompt()
        
       
        chain = prompt | llm | parser
        
        
        result = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: chain.invoke({
                "text": resume_text,
                "format_instructions": parser.get_format_instructions()
            })
        )
        
        return result.dict()
    
    finally:
        
        try:
            os.remove(file_path)
        except:
            pass  


async def parse_resumes_batch(files: List):
    """
    Parse multiple resumes concurrently for better throughput.
    """
    tasks = [parse_resume(file) for file in files]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

async def parse_resume_fast(file):
    """
    Ultra-fast version with maximum optimizations (may sacrifice some accuracy).
    """
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
   
    await save_file_async(file, file_path)
    
    try:
       
        if file.filename.lower().endswith(".pdf"):
           
            with pdfplumber.open(file_path) as pdf:
                if pdf.pages:
                    resume_text = pdf.pages[0].extract_text() or ""
                else:
                    resume_text = ""
        else:
            
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                resume_text = await f.read(3000)
        
       
        
      
        fast_prompt = ChatPromptTemplate.from_messages([
            ("system", "Extract resume data efficiently. Be brief but complete."),
            ("human", "Resume text:\n{text}\n\nReturn: {format_instructions}")
        ])
        
        parser, _ = get_parser_and_prompt()
        chain = fast_prompt | llm | parser
        
        result = chain.invoke({
            "text": resume_text,
            "format_instructions": parser.get_format_instructions()
        })
        
        return result.dict()
    
    finally:
        try:
            os.remove(file_path)
        except:
            pass