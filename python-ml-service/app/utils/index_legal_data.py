import pandas as pd
import asyncio
from pathlib import Path
from loguru import logger
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from services.rag_service import get_rag_service


async def index_legal_documents():
    """Index legal documents from CSV file"""
    
    # Path to CSV file (should be in frontend/public)
    csv_path = Path(__file__).parent.parent.parent.parent / "frontend" / "public" / "50_dataset_van_ban_phap_luat.csv"
    
    if not csv_path.exists():
        logger.error(f"CSV file not found at: {csv_path}")
        return
    
    logger.info(f"Loading legal documents from: {csv_path}")
    
    try:
        # Read CSV file
        df = pd.read_csv(csv_path, encoding='utf-8')
        logger.info(f"Loaded {len(df)} documents from CSV")
        
        # Display columns
        logger.info(f"CSV Columns: {df.columns.tolist()}")
        
        # Prepare documents for indexing
        documents = []
        
        for idx, row in df.iterrows():
            # Combine relevant fields into content
            content_parts = []
            
            # Add all available fields to content
            for col in df.columns:
                value = row[col]
                if pd.notna(value) and str(value).strip():
                    content_parts.append(f"{col}: {value}")
            
            content = "\n".join(content_parts)
            
            # Create metadata
            metadata = {
                "doc_index": idx,
                "source": "legal_documents_csv"
            }
            
            # Add some key fields to metadata if they exist
            key_fields = ["so_ky_hieu", "trich_yeu", "loai_van_ban", "noi_ban_hanh", "ngay_ban_hanh"]
            for field in key_fields:
                if field in row and pd.notna(row[field]):
                    metadata[field] = str(row[field])
            
            documents.append({
                "content": content,
                "metadata": metadata
            })
            
            # Log progress
            if (idx + 1) % 10 == 0:
                logger.info(f"Prepared {idx + 1}/{len(df)} documents...")
        
        logger.info(f"Prepared {len(documents)} documents for indexing")
        
        # Get RAG service and index documents
        rag_service = get_rag_service()
        
        # Index in batches to avoid memory issues
        batch_size = 10
        total_chunks = 0
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            logger.info(f"Indexing batch {i//batch_size + 1}/{(len(documents) + batch_size - 1)//batch_size}...")
            
            result = await rag_service.index_documents(batch)
            
            if result.get("success"):
                total_chunks += result.get("chunks_created", 0)
                logger.info(f"✅ Batch indexed: {result.get('chunks_created')} chunks")
            else:
                logger.error(f"❌ Failed to index batch: {result.get('error')}")
        
        logger.info(f"""
╔══════════════════════════════════════════════════════╗
║           INDEXING COMPLETED SUCCESSFULLY            ║
╠══════════════════════════════════════════════════════╣
║  Documents processed: {len(documents):>30} ║
║  Total chunks created: {total_chunks:>29} ║
║  Status: {'SUCCESS':>38} ║
╚══════════════════════════════════════════════════════╝
        """)
        
    except Exception as e:
        logger.error(f"❌ Error during indexing: {e}")
        raise


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Starting Legal Documents Indexing Process")
    logger.info("=" * 60)
    
    asyncio.run(index_legal_documents())
