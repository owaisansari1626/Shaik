from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "Success"

class ErrorResponse(BaseModel):
    success: bool = False
    data: Optional[dict] = None
    message: str
