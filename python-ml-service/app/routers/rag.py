from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from loguru import logger

from app.services.rag_service import get_rag_service


router = APIRouter()


# Request/Response models
class ChatMessage(BaseModel):
    """Single chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class AskQuestionRequest(BaseModel):
    """Request model for asking a question"""
    question: str = Field(..., min_length=3, description="User's question")
    top_k: Optional[int] = Field(5, ge=1, le=10, description="Number of documents to retrieve")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    chat_history: Optional[List[ChatMessage]] = Field(None, description="Previous chat messages for context")


class AskQuestionResponse(BaseModel):
    """Response model for question answer"""
    success: bool
    answer: str
    sources: Optional[List[dict]] = None
    processing_time: Optional[float] = None
    model_used: Optional[str] = None
    timestamp: Optional[str] = None
    error: Optional[str] = None


class IndexDocumentRequest(BaseModel):
    """Request model for indexing documents"""
    documents: List[dict] = Field(..., description="List of documents with content and metadata")


class IndexDocumentResponse(BaseModel):
    """Response model for indexing"""
    success: bool
    documents_indexed: Optional[int] = None
    chunks_created: Optional[int] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None


class StatusResponse(BaseModel):
    """Response model for status check"""
    status: str
    vectorstore: Optional[dict] = None
    llm: Optional[dict] = None
    embeddings: Optional[dict] = None
    error: Optional[str] = None


@router.post("/ask", response_model=AskQuestionResponse)
async def ask_question(request: AskQuestionRequest):
    """
    Ask a legal question and get an AI-powered answer
    
    This endpoint uses RAG (Retrieval Augmented Generation) to:
    1. Search relevant legal documents from the vector database
    2. Generate a comprehensive answer using Google Gemini
    3. Provide source citations
    
    Example:
    ```json
    {
        "question": "Quyền lợi của người lao động khi nghỉ việc là gì?",
        "top_k": 5
    }
    ```
    """
    try:
        logger.info(f"Received question: {request.question[:100]}...")
        if request.chat_history:
            logger.info(f"With chat history: {len(request.chat_history)} messages")
        
        rag_service = get_rag_service()
        
        # Convert chat_history to dict format
        chat_history_dict = None
        if request.chat_history:
            chat_history_dict = [
                {"role": msg.role, "content": msg.content}
                for msg in request.chat_history
            ]
        
        result = await rag_service.ask_question(
            question=request.question,
            top_k=request.top_k,
            chat_history=chat_history_dict
        )
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Unknown error")
            )
        
        return AskQuestionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ask_question endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/index", response_model=IndexDocumentResponse)
async def index_documents(request: IndexDocumentRequest):
    """
    Index documents into the vector database
    
    Documents should have the following structure:
    ```json
    {
        "documents": [
            {
                "content": "Document content here...",
                "metadata": {
                    "title": "Document title",
                    "source": "Source info",
                    "date": "2024-01-01"
                }
            }
        ]
    }
    ```
    """
    try:
        logger.info(f"Indexing {len(request.documents)} documents...")
        
        if not request.documents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No documents provided"
            )
        
        rag_service = get_rag_service()
        result = await rag_service.index_documents(request.documents)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Failed to index documents")
            )
        
        return IndexDocumentResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in index_documents endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get RAG service status and statistics
    
    Returns information about:
    - Vector database status and document count
    - LLM model status
    - Embeddings model status
    """
    try:
        rag_service = get_rag_service()
        status_info = await rag_service.get_status()
        return StatusResponse(**status_info)
        
    except Exception as e:
        logger.error(f"Error in get_status endpoint: {e}")
        return StatusResponse(
            status="error",
            error=str(e)
        )


@router.get("/documents")
async def get_documents(limit: int = 20):
    """
    Get sample documents to see what topics are available in the database
    
    This helps users know what questions they can ask
    """
    try:
        rag_service = get_rag_service()
        result = await rag_service.get_sample_documents(limit=limit)
        return result
    except Exception as e:
        logger.error(f"Error in get_documents endpoint: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/health")
async def health_check():
    """Simple health check for the RAG router"""
    return {
        "status": "healthy",
        "service": "rag",
        "endpoints": {
            "ask": "/rag/ask",
            "index": "/rag/index",
            "status": "/rag/status",
            "documents": "/rag/documents"
        }
    }
