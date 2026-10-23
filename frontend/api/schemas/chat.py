from typing import List, Optional
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str
    action: Optional[str] = None
    type: Optional[str] = None

    def get_action(self) -> str:
        return self.action or self.type or "ask"

class ChatResponse(BaseModel):
    response: str = ""
    type: str = "answer"
    action_items: List[str] = Field(default_factory=list)
    summary: str = ""
