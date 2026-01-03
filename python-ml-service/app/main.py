from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from loguru import logger

from app.routers import rag, pdf
from app.config import get_settings
from app.services.rag_service import get_rag_service
from app.services.pdf_service import get_pdf_service


# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting Legal Connect ML Service...")
    settings = get_settings()
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"LLM Model: {settings.llm_model}")
    logger.info(f"Embedding Model: {settings.embedding_model}")
    
    # Pre-load RAG service to avoid lazy loading on first request
    logger.info("🔄 Pre-loading RAG service and embeddings...")
    try:
        rag_service = get_rag_service()
        logger.info("✅ RAG service pre-loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to pre-load RAG service: {e}")
    
    # Pre-load PDF service
    logger.info("🔄 Pre-loading PDF service...")
    try:
        pdf_service = get_pdf_service()
        logger.info("✅ PDF service pre-loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to pre-load PDF service: {e}")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down Legal Connect ML Service...")


# Create FastAPI app
app = FastAPI(
    title="Legal Connect ML Service",
    description="Machine Learning & AI Service for Legal Connect Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "legal-connect-ml",
            "timestamp": time.time()
        }
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Legal Connect ML Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "rag": {
                "ask": "/rag/ask",
                "index": "/rag/index",
                "status": "/rag/status"
            },
            "pdf": {
                "summarize": "/pdf/summarize",
                "upload": "/pdf/upload",
                "ask": "/pdf/ask",
                "health": "/pdf/health"
            }
        }
    }


# Include routers
app.include_router(rag.router, prefix="/rag", tags=["RAG"])
app.include_router(pdf.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
