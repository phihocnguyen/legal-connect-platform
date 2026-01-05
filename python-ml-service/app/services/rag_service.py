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
        prompt_template = """Bạn là một trợ lý AI chuyên về tư vấn pháp luật Việt Nam với khả năng phân tích văn bản pháp luật chính xác.

QUAN TRỌNG: Bạn PHẢI dựa vào CHÍNH XÁC thông tin từ các văn bản pháp luật được cung cấp bên dưới. KHÔNG được tự suy luận hoặc thêm thông tin không có trong văn bản.

=== VĂN BẢN PHÁP LUẬT ĐƯỢC CUNG CẤP ===
{context}
=== KẾT THÚC VĂN BẢN ===

Câu hỏi của người dùng: {question}

HƯỚNG DẪN TRẢ LỜI (BẮT BUỘC):

1. **Đọc kỹ và phân tích** tất cả các văn bản pháp luật được cung cấp ở trên
2. **Trích xuất thông tin chính xác** từ văn bản:
   - Mức phạt (nếu có)
   - Tên văn bản, số hiệu
   - Điều, khoản cụ thể
   - Ngày ban hành, hiệu lực
3. **Trả lời theo cấu trúc**:
   - Câu trả lời trực tiếp cho câu hỏi
   - Trích dẫn cụ thể: "Theo [Tên văn bản], Điều X, Khoản Y..."
   - Giải thích chi tiết nếu cần
4. **Nếu KHÔNG tìm thấy thông tin** trong văn bản được cung cấp:
   - Nói rõ: "Trong các văn bản pháp luật được cung cấp, tôi không tìm thấy thông tin về..."
   - KHÔNG đưa ra thông tin từ kiến thức chung
   - Gợi ý người dùng tìm kiếm thêm văn bản khác nếu cần

5. **Định dạng câu trả lời**:
   - Sử dụng markdown để format rõ ràng
   - Đánh số thứ tự nếu có nhiều điểm
   - In đậm các thông tin quan trọng (mức phạt, tên văn bản)

LƯU Ý: Ưu tiên độ chính xác hơn là đầy đủ. Nếu không chắc chắn, hãy nói rõ.

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
    
    async def ask_question(self, question: str, top_k: Optional[int] = None, chat_history: Optional[List[dict]] = None) -> dict:
        """
        Ask a question and get an answer from the RAG system
        
        Args:
            question: User's question
            top_k: Number of documents to retrieve (optional)
            chat_history: Previous chat messages for context (optional)
        
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
            
            # Build context from chat history
            history_context = ""
            if chat_history and len(chat_history) > 0:
                logger.info(f"Including {len(chat_history)} previous messages for context")
                history_context = "\n\n=== LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ ===\n"
                for msg in chat_history[-4:]:  # Only last 4 messages to avoid token limit
                    role = "Người dùng" if msg["role"].lower() in ["user", "USER"] else "Trợ lý AI"
                    history_context += f"{role}: {msg['content']}\n"
                history_context += "=== KẾT THÚC LỊCH SỬ ===\n\n"
            
            # Combine history with current question
            full_query = history_context + question if history_context else question
            
            # Get answer from QA chain
            result = await self.qa_chain.ainvoke({"query": full_query})
            
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
    
    async def get_sample_documents(self, limit: int = 10) -> dict:
        """Get sample documents to show what topics are available"""
        try:
            collection = self.vectorstore._collection
            
            # Get sample documents
            results = collection.get(
                limit=limit,
                include=["metadatas", "documents"]
            )
            
            # Extract unique document titles/sources
            documents_info = []
            seen_titles = set()
            
            for i, metadata in enumerate(results.get("metadatas", [])):
                title = metadata.get("title", metadata.get("source", "Unknown"))
                
                if title not in seen_titles:
                    seen_titles.add(title)
                    documents_info.append({
                        "title": title,
                        "source": metadata.get("source", ""),
                        "metadata": metadata,
                        "preview": results["documents"][i][:200] + "..." if len(results["documents"][i]) > 200 else results["documents"][i]
                    })
            
            return {
                "success": True,
                "total_documents": collection.count(),
                "sample_documents": documents_info[:limit],
                "message": f"Showing {len(documents_info[:limit])} sample documents"
            }
            
        except Exception as e:
            logger.error(f"Error getting sample documents: {e}")
            return {
                "success": False,
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
