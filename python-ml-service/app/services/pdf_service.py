"""
PDF Service for document processing, summarization, and Q&A using Llama
"""
import os
import io
import hashlib
from typing import List, Dict, Optional
from pathlib import Path
import pypdf
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from loguru import logger
import httpx

from app.config import get_settings


class PDFService:
    """Service for PDF processing and Q&A"""
    
    def __init__(self):
        self.settings = get_settings()
        
        # Initialize embeddings for vector search
        logger.info("Initializing PDF embeddings...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.settings.embedding_model,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
        )
        
        # Store for PDF sessions
        self.pdf_stores: Dict[str, Chroma] = {}
        
        logger.info("✅ PDF Service initialized successfully")
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        try:
            try:
                doc = fitz.open(stream=pdf_content, filetype="pdf")
                text_parts = []
                for page in doc:
                    text = page.get_text()
                    if text.strip():
                        text_parts.append(text)
                doc.close()
                
                if text_parts:
                    full_text = "\n\n".join(text_parts)
                    logger.info(f"Extracted {len(full_text)} characters using PyMuPDF")
                    return full_text
            except Exception as e:
                logger.warning(f"PyMuPDF extraction failed: {e}")
            
            pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_content))
            text_parts = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text.strip():
                    text_parts.append(text)
            
            full_text = "\n\n".join(text_parts)
            logger.info(f"Extracted {len(full_text)} characters using pypdf")
            return full_text
            
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raise ValueError(f"Không thể trích xuất văn bản từ PDF: {str(e)}")
    
    def generate_pdf_id(self, pdf_content: bytes) -> str:
        return hashlib.md5(pdf_content).hexdigest()
    
    def save_pdf_file(self, pdf_content: bytes, pdf_id: str, filename: str) -> Path:
        file_path = self.pdf_upload_dir / f"{pdf_id}_{filename}"
        with open(file_path, 'wb') as f:
            f.write(pdf_content)
        logger.info(f"Saved PDF to {file_path}")
        return file_path
    
    async def call_llama(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            api_key = self.settings.openrouter_api_key
            if not api_key:
                raise ValueError("OpenRouter API key not configured")
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.settings.llm_model,
                        "messages": messages,
                        "temperature": self.settings.temperature,
                        "max_tokens": self.settings.max_tokens,
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"OpenRouter API error: {response.text}")
                    raise ValueError(f"API call failed: {response.status_code}")
                
                result = response.json()
                return result["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"Error calling Llama: {e}")
            raise
    
    async def summarize_pdf(self, pdf_content: bytes) -> Dict:
        try:
            logger.info("Extracting text from PDF...")
            text = self.extract_text_from_pdf(pdf_content)
            
            if not text or len(text.strip()) < 50:
                raise ValueError("PDF không chứa đủ nội dung văn bản để tóm tắt")
            
            max_length = 15000
            
            if len(text) <= max_length:
                summary = await self._summarize_text(text)
            else:
                chunks = self.text_splitter.split_text(text)
                logger.info(f"Text split into {len(chunks)} chunks for summarization")
                
                chunk_summaries = []
                for i, chunk in enumerate(chunks[:10]):
                    logger.info(f"Summarizing chunk {i+1}/{min(len(chunks), 10)}")
                    chunk_summary = await self._summarize_text(chunk, is_partial=True)
                    chunk_summaries.append(chunk_summary)
                
                combined = "\n\n".join(chunk_summaries)
                summary = await self._summarize_text(combined, is_final=True)
            
            word_count = len(text.split())
            summary_word_count = len(summary.split())
            
            return {
                "summary": summary,
                "word_count": word_count,
                "summary_word_count": summary_word_count,
                "compression_ratio": round(word_count / max(summary_word_count, 1), 2)
            }
            
        except Exception as e:
            logger.error(f"Error in summarize_pdf: {e}")
            raise
    
    async def _summarize_text(self, text: str, is_partial: bool = False, is_final: bool = False) -> str:
        if is_final:
            system_prompt = """Bạn là trợ lý AI chuyên tóm tắt văn bản pháp luật tiếng Việt.
Nhiệm vụ của bạn là tổng hợp các phần tóm tắt thành một bản tóm tắt tổng thể, mạch lạc và đầy đủ."""
            
            prompt = f"""Dưới đây là các phần tóm tắt của một văn bản pháp luật:

{text}

Hãy tổng hợp lại thành một bản tóm tắt hoàn chỉnh, bao gồm:
1. Nội dung chính của văn bản
2. Các điểm quan trọng cần lưu ý
3. Phạm vi áp dụng (nếu có)

Tóm tắt bằng tiếng Việt, rõ ràng và súc tích."""
        elif is_partial:
            system_prompt = """Bạn là trợ lý AI chuyên tóm tắt văn bản pháp luật tiếng Việt.
Hãy tóm tắt ngắn gọn phần văn bản được cung cấp."""
            
            prompt = f"""Tóm tắt ngắn gọn nội dung chính của đoạn văn bản sau:

{text}

Tóm tắt bằng tiếng Việt, tập trung vào các điểm chính."""
        else:
            system_prompt = """Bạn là trợ lý AI chuyên tóm tắt văn bản pháp luật tiếng Việt.
Hãy tạo bản tóm tắt chi tiết nhưng súc tích của văn bản."""
            
            prompt = f"""Hãy tóm tắt văn bản pháp luật sau đây:

{text}

Tóm tắt cần bao gồm:
1. Tiêu đề/loại văn bản (nếu có)
2. Nội dung chính
3. Các điểm quan trọng
4. Phạm vi áp dụng (nếu có)
5. Ngày hiệu lực (nếu có)

Tóm tắt bằng tiếng Việt, rõ ràng và đầy đủ."""
        
        return await self.call_llama(prompt, system_prompt)
    
    async def setup_pdf_qa(self, pdf_content: bytes, pdf_id: str) -> Dict:
        try:
            logger.info(f"Setting up Q&A for PDF: {pdf_id}")
            text = self.extract_text_from_pdf(pdf_content)
            
            if not text or len(text.strip()) < 50:
                raise ValueError("PDF không chứa đủ nội dung văn bản")
            
            chunks = self.text_splitter.split_text(text)
            logger.info(f"Split PDF into {len(chunks)} chunks")
            
            documents = [
                Document(page_content=chunk, metadata={"pdf_id": pdf_id, "chunk_id": i})
                for i, chunk in enumerate(chunks)
            ]
            
            vector_store = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                collection_name=f"pdf_{pdf_id}"
            )
            
            self.pdf_stores[pdf_id] = vector_store
            
            logger.info(f"✅ PDF Q&A setup complete for {pdf_id}")
            
            return {
                "pdf_id": pdf_id,
                "chunks": len(chunks),
                "total_characters": len(text),
                "status": "ready"
            }
            
        except Exception as e:
            logger.error(f"Error in setup_pdf_qa: {e}")
            raise
    
    async def ask_pdf(self, pdf_id: str, question: str) -> Dict:
        try:
            if pdf_id not in self.pdf_stores:
                raise ValueError(f"PDF {pdf_id} chưa được tải lên. Vui lòng tải PDF trước.")
            
            vector_store = self.pdf_stores[pdf_id]
            
            logger.info(f"Searching for relevant content for question: {question}")
            results = vector_store.similarity_search(question, k=self.settings.top_k)
            
            if not results:
                return {
                    "answer": "Không tìm thấy thông tin liên quan trong tài liệu.",
                    "sources": []
                }
            
            context_parts = []
            sources = []
            for i, doc in enumerate(results):
                context_parts.append(f"[Đoạn {i+1}]\n{doc.page_content}")
                sources.append({
                    "chunk_id": doc.metadata.get("chunk_id", i),
                    "content": doc.page_content[:200] + "..."
                })
            
            context = "\n\n".join(context_parts)
            
            system_prompt = """Bạn là trợ lý AI chuyên tư vấn pháp luật tiếng Việt.
Nhiệm vụ của bạn là trả lời câu hỏi dựa trên nội dung tài liệu được cung cấp."""
            
            prompt = f"""Dựa trên nội dung tài liệu dưới đây, hãy trả lời câu hỏi một cách chính xác và đầy đủ:

NỘI DUNG TÀI LIỆU:
{context}

CÂU HỎI: {question}

Hãy trả lời câu hỏi bằng tiếng Việt. Nếu thông tin không có trong tài liệu, hãy nói rõ điều đó. Trích dẫn các đoạn liên quan khi cần thiết."""
            
            answer = await self.call_llama(prompt, system_prompt)
            
            return {
                "answer": answer,
                "sources": sources,
                "context_used": len(results)
            }
            
        except Exception as e:
            logger.error(f"Error in ask_pdf: {e}")
            raise
    
    def clear_pdf_session(self, pdf_id: str):
        if pdf_id in self.pdf_stores:
            del self.pdf_stores[pdf_id]
            logger.info(f"Cleared PDF session: {pdf_id}")
    
    def clear_all_sessions(self):
        count = len(self.pdf_stores)
        self.pdf_stores.clear()
        logger.info(f"Cleared all {count} PDF sessions")


_pdf_service: Optional[PDFService] = None


def get_pdf_service() -> PDFService:
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PDFService()
    return _pdf_service
