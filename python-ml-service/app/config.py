from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API Keys
    google_api_key: str = ""
    openai_api_key: str = ""
    openrouter_api_key: str = ""
    
    # Environment
    environment: str = "development"
    
    # ChromaDB
    chroma_persist_dir: str = "./app/data/vector_stores"
    collection_name: str = "legal_documents"
    
    # Model settings
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    llm_model: str = "meta-llama/llama-3.3-70b-instruct:free"
    llm_provider: str = "openrouter"  # "google", "openai", or "openrouter"
    temperature: float = 0.3
    max_tokens: int = 2048
    
    # RAG settings
    top_k: int = 5
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # PDF settings
    pdf_upload_dir: str = "./app/data/pdfs"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
