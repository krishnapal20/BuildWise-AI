from typing import List
from pydantic import BaseModel, Field

class KnowledgeRequest(BaseModel):
    question: str
    category: str = "General"

class KnowledgeResponse(BaseModel):
    answer: str = ""
    key_points: List[str] = Field(default_factory=list)
    references: List[str] = Field(default_factory=list)
    related_topics: List[str] = Field(default_factory=list)
    category: str = "General"
