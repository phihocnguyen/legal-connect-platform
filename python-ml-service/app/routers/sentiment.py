from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.sentiment_service import get_sentiment_service, SentimentService

router = APIRouter(
    prefix="/sentiment",
    tags=["Sentiment Analysis"]
)

class SentimentRequest(BaseModel):
    text: str

class BatchSentimentRequest(BaseModel):
    texts: List[str]

@router.post("/analyze")
async def analyze_sentiment(
    request: SentimentRequest,
    service: SentimentService = Depends(get_sentiment_service)
):
    """Analyze sentiment of a single post or comment"""
    result = service.analyze_text(request.text)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/analyze-batch")
async def analyze_sentiment_batch(
    request: BatchSentimentRequest,
    service: SentimentService = Depends(get_sentiment_service)
):
    """Analyze sentiment of multiple posts or comments"""
    results = service.analyze_batch(request.texts)
    return {"results": results}
