import os
from typing import List, Optional
from datetime import datetime
from loguru import logger

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate

from app.config import get_settings


class RAGService:
    """RAG Service for Legal Q&A using ChromaDB and Google Gemini"""
    
    def __init__(self):
        self.settings = get_settings()
        self.embeddings = None
        self.vectorstore = None
        self.llm = None
        self.qa_chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize embeddings, vector store, and LLM"""
        try:
            logger.info("Initializing RAG Service...")
            
            # Initialize embeddings (multilingual model for Vietnamese support)
            logger.info(f"Loading embeddings model: {self.settings.embedding_model}")
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.settings.embedding_model,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            # Initialize ChromaDB
            logger.info(f"Connecting to ChromaDB at: {self.settings.chroma_persist_dir}")
            os.makedirs(self.settings.chroma_persist_dir, exist_ok=True)
            
            chroma_client = chromadb.PersistentClient(
                path=self.settings.chroma_persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            
            # Initialize vector store
            self.vectorstore = Chroma(
                client=chroma_client,
                collection_name=self.settings.collection_name,
                embedding_function=self.embeddings
            )
            
            # Initialize LLM based on provider
            if self.settings.llm_provider == "openrouter" and self.settings.openrouter_api_key:
                logger.info(f"Initializing OpenRouter LLM: {self.settings.llm_model}")
                self.llm = ChatOpenAI(
                    model=self.settings.llm_model,
                    openai_api_key=self.settings.openrouter_api_key,
                    openai_api_base="https://openrouter.ai/api/v1",
                    temperature=self.settings.temperature,
                    max_tokens=self.settings.max_tokens,
                    default_headers={
                        "HTTP-Referer": "https://legal-connect.com",
                        "X-Title": "Legal Connect Platform"
                    }
                )
            elif self.settings.llm_provider == "google" and self.settings.google_api_key:
                logger.info(f"Initializing Google Gemini: {self.settings.llm_model}")
                self.llm = ChatGoogleGenerativeAI(
                    model=self.settings.llm_model,
                    google_api_key=self.settings.google_api_key,
                    temperature=self.settings.temperature,
                    max_tokens=self.settings.max_tokens,
                    convert_system_message_to_human=True
                )
            else:
                logger.warning(f"No API key found for provider: {self.settings.llm_provider}. LLM will not be available.")
            
            # Create QA chain with custom prompt
            if self.llm and self.vectorstore:
                self._create_qa_chain()
            
            logger.info("✅ RAG Service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG Service: {e}")
            raise
    
    def _create_qa_chain(self):
        """Create QA chain with custom Vietnamese legal prompt"""
        
        # Custom prompt template for Vietnamese legal Q&A
        prompt_template = """Bạn là một trợ lý AI chuyên về tư vấn pháp luật Việt Nam. 
Nhiệm vụ của bạn là trả lời câu hỏi dựa trên các văn bản pháp luật được cung cấp.

Ngữ cảnh từ văn bản pháp luật:
{context}

Câu hỏi: {question}

Hướng dẫn trả lời:
1. Trả lời bằng tiếng Việt một cách rõ ràng, chuyên nghiệp
2. Dựa trên thông tin từ văn bản pháp luật được cung cấp
3. Nếu không có thông tin trong văn bản, hãy nói rõ điều đó
4. Trích dẫn tên văn bản, số hiệu, điều khoản nếu có
5. Cung cấp giải thích dễ hiểu cho người không chuyên

Trả lời:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create retrieval QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(
                search_kwargs={"k": self.settings.top_k}
            ),
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )
        
        logger.info("✅ QA Chain created successfully")
    
    async def ask_question(self, question: str, top_k: Optional[int] = None) -> dict:
        """
        Ask a question and get an answer from the RAG system
        
        Args:
            question: User's question
            top_k: Number of documents to retrieve (optional)
        
        Returns:
            dict with answer, sources, and metadata
        """
        try:
            start_time = datetime.now()
            
            if not self.qa_chain:
                return {
                    "success": False,
                    "error": "RAG system not initialized. Please check API key configuration.",
                    "answer": "Xin lỗi, hệ thống AI chưa được cấu hình đầy đủ. Vui lòng kiểm tra API key."
                }
            
            # Update top_k if provided
            if top_k:
                self.qa_chain.retriever.search_kwargs["k"] = top_k
            
            logger.info(f"Processing question: {question[:100]}...")
            
            # Get answer from QA chain
            result = await self.qa_chain.ainvoke({"query": question})
            
            # Extract answer and sources
            answer = result.get("result", "")
            source_documents = result.get("source_documents", [])
            
            # Format sources
            sources = []
            for doc in source_documents:
                sources.append({
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                })
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"✅ Question answered in {processing_time:.2f}s")
            
            return {
                "success": True,
                "answer": answer,
                "sources": sources,
                "processing_time": processing_time,
                "model_used": self.settings.llm_model,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error answering question: {e}")
            return {
                "success": False,
                "error": str(e),
                "answer": "Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại."
            }
    
    async def index_documents(self, documents: List[dict]) -> dict:
        """
        Index documents into ChromaDB
        
        Args:
            documents: List of documents with 'content' and 'metadata' fields
        
        Returns:
            dict with indexing status
        """
        try:
            logger.info(f"Indexing {len(documents)} documents...")
            start_time = datetime.now()
            
            # Text splitter
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.settings.chunk_size,
                chunk_overlap=self.settings.chunk_overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            
            # Process each document
            texts = []
            metadatas = []
            
            for doc in documents:
                content = doc.get("content", "")
                metadata = doc.get("metadata", {})
                
                # Split into chunks
                chunks = text_splitter.split_text(content)
                
                for i, chunk in enumerate(chunks):
                    texts.append(chunk)
                    chunk_metadata = metadata.copy()
                    chunk_metadata["chunk_index"] = i
                    chunk_metadata["total_chunks"] = len(chunks)
                    metadatas.append(chunk_metadata)
            
            # Add to vector store
            if texts:
                self.vectorstore.add_texts(
                    texts=texts,
                    metadatas=metadatas
                )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"✅ Indexed {len(texts)} chunks in {processing_time:.2f}s")
            
            return {
                "success": True,
                "documents_indexed": len(documents),
                "chunks_created": len(texts),
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"❌ Error indexing documents: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_status(self) -> dict:
        """Get RAG service status"""
        try:
            # Get collection stats
            collection = self.vectorstore._collection
            count = collection.count()
            
            return {
                "status": "ready",
                "vectorstore": {
                    "type": "ChromaDB",
                    "collection": self.settings.collection_name,
                    "document_count": count
                },
                "llm": {
                    "model": self.settings.llm_model,
                    "status": "active" if self.llm else "not configured"
                },
                "embeddings": {
                    "model": self.settings.embedding_model,
                    "status": "active"
                }
            }
        except Exception as e:
            logger.error(f"Error getting status: {e}")
            return {
                "status": "error",
                "error": str(e)
            }


# Singleton instance
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    """Get or create RAG service singleton"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
