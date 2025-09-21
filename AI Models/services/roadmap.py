from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel,Field
import json
from typing import Optional,List
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv
import os
load_dotenv()

# Initialize model lazily to avoid startup errors
def get_chat_model():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")
    return ChatOpenAI(model='gpt-4.1-mini-2025-04-14', temperature=0.5)

class roadmapstep(BaseModel):
    step:int =Field(description='step of the roadmap')
    concept:str = Field(description='name of the concept')
    
class Roadmap(BaseModel):
    steps : List[roadmapstep]= Field(
        description="A roadmap with sequential steps (maximum 10 steps)"
    )
parser = JsonOutputParser()

template = PromptTemplate(template='''
     You are an expert career mentor and curriculum designer. 
    Generate a step-by-step learning roadmap for becoming successful in {domain}.

    Rules:
    - Maximum 10 steps in total.
    - Sequence should be logical.
    - Sequential order only (no stages, no grouping).
    - Each step must include:
        1. Concept/Skill Name

    Ensure the order is logical and dependencies are respected.
    \n {format_instruction}
    ''',input_variables=['domain'],validate_template=True,partial_variables={'format_instruction':parser.get_format_instructions()})

model_structure = get_chat_model().with_structured_output(Roadmap)

chain = template | model_structure



