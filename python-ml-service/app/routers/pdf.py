from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from app.services.pdf_service import get_pdf_service


router = APIRouter(
    prefix="/pdf",
    tags=["PDF Processing"]
)


class QuestionRequest(BaseModel):
    pdf_id: str
    question: str


class PDFResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


@router.post("/summarize", response_model=PDFResponse)
async def summarize_pdf(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Chỉ chấp nhận file PDF"
            )
        
        logger.info(f"Processing PDF: {file.filename}")
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="File PDF rỗng"
            )
        
        pdf_service = get_pdf_service()
        
        result = await pdf_service.summarize_pdf(content)
        
        logger.info(f"✅ Successfully summarized PDF: {file.filename}")
        
        return PDFResponse(
            success=True,
            message="Tóm tắt PDF thành công",
            data={
                "filename": file.filename,
                **result
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error summarizing PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi tóm tắt PDF: {str(e)}"
        )


@router.post("/summarize-id", response_model=PDFResponse)
async def summarize_pdf_by_id(
    file_id: str = Form(...),
    max_length: int = Form(200)
):
    try:
        pdf_service = get_pdf_service()
        content = pdf_service.get_pdf_content(file_id)
        
        if not content:
            raise HTTPException(
                status_code=404,
                detail=f"PDF with ID {file_id} not found"
            )
            
        result = await pdf_service.summarize_pdf(content)
        
        return PDFResponse(
            success=True,
            message="Tóm tắt PDF thành công",
            data={
                "pdf_id": file_id,
                **result
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error summarizing PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi tóm tắt PDF: {str(e)}"
        )


@router.post("/upload", response_model=PDFResponse)
async def upload_pdf_for_qa(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Chỉ chấp nhận file PDF"
            )
        
        logger.info(f"Uploading PDF for Q&A: {file.filename}")
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="File PDF rỗng"
            )
        
        pdf_service = get_pdf_service()
        pdf_id = pdf_service.generate_pdf_id(content)
        
        pdf_service.save_pdf_file(content, pdf_id, file.filename)
        
        result = await pdf_service.setup_pdf_qa(content, pdf_id)
        
        logger.info(f"✅ PDF ready for Q&A: {file.filename} (ID: {pdf_id})")
        
        return PDFResponse(
            success=True,
            message="Upload PDF thành công. Bạn có thể bắt đầu đặt câu hỏi.",
            data={
                "filename": file.filename,
                "file_id": pdf_id,
                **result
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error uploading PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi tải PDF: {str(e)}"
        )


@router.post("/ask", response_model=PDFResponse)
async def ask_question(request: QuestionRequest):
    try:
        if not request.question or len(request.question.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Câu hỏi quá ngắn. Vui lòng nhập câu hỏi chi tiết hơn."
            )
        
        pdf_service = get_pdf_service()
        
        logger.info(f"Question for PDF {request.pdf_id}: {request.question}")
        result = await pdf_service.ask_pdf(request.pdf_id, request.question)
        
        logger.info(f"✅ Answer generated for PDF {request.pdf_id}")
        
        return PDFResponse(
            success=True,
            message="Trả lời câu hỏi thành công",
            data={
                "question": request.question,
                **result
            }
        )
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi trả lời câu hỏi: {str(e)}"
        )


@router.delete("/session/{pdf_id}", response_model=PDFResponse)
async def clear_pdf_session(pdf_id: str):
    try:
        pdf_service = get_pdf_service()
        pdf_service.clear_pdf_session(pdf_id)
        
        return PDFResponse(
            success=True,
            message=f"Đã xóa phiên làm việc PDF: {pdf_id}",
            data={"pdf_id": pdf_id}
        )
        
    except Exception as e:
        logger.error(f"Error clearing session: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xóa phiên: {str(e)}"
        )


@router.delete("/sessions/all", response_model=PDFResponse)
async def clear_all_sessions():
    try:
        pdf_service = get_pdf_service()
        pdf_service.clear_all_sessions()
        
        return PDFResponse(
            success=True,
            message="Đã xóa tất cả phiên làm việc PDF",
            data={}
        )
        
    except Exception as e:
        logger.error(f"Error clearing all sessions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xóa phiên: {str(e)}"
        )


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PDF Processing",
        "endpoints": [
            "/pdf/summarize",
            "/pdf/upload",
            "/pdf/ask",
            "/pdf/session/{pdf_id}",
            "/pdf/sessions/all"
        ]
    }
