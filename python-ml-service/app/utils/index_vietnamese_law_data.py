import pandas as pd
import asyncio
import json
import argparse
from pathlib import Path
from loguru import logger
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from services.rag_service import get_rag_service


def save_checkpoint(checkpoint_file: Path, last_indexed: int, total_documents: int):
    """Save indexing progress to checkpoint file"""
    checkpoint_data = {
        "last_indexed": last_indexed,
        "total_documents": total_documents,
        "timestamp": pd.Timestamp.now().isoformat()
    }
    with open(checkpoint_file, 'w') as f:
        json.dump(checkpoint_data, f, indent=2)
    logger.info(f"💾 Checkpoint saved: {last_indexed}/{total_documents}")


def load_checkpoint(checkpoint_file: Path) -> dict:
    """Load indexing progress from checkpoint file"""
    if not checkpoint_file.exists():
        return {"last_indexed": 0, "total_documents": 0}
    
    try:
        with open(checkpoint_file, 'r') as f:
            checkpoint = json.load(f)
        logger.info(f"📂 Checkpoint loaded: Resuming from document {checkpoint['last_indexed']}")
        return checkpoint
    except Exception as e:
        logger.warning(f"Failed to load checkpoint: {e}")
        return {"last_indexed": 0, "total_documents": 0}


async def index_vietnamese_law_corpus(start_from: int = None, reset: bool = False):
    """Index Vietnamese Law Corpus from CSV file"""
    
    # Path to downloaded CSV file
    data_dir = Path(__file__).parent.parent / "data"
    csv_path = data_dir / "vietnamese_law_corpus_combined.csv"
    checkpoint_file = data_dir / ".indexing_checkpoint.json"
    
    if not csv_path.exists():
        logger.error(f"CSV file not found at: {csv_path}")
        logger.error("Please run download script first:")
        logger.error("  python -m app.utils.download_dataset")
        return
    
    logger.info("=" * 70)
    logger.info("Indexing Vietnamese Law Corpus")
    logger.info("=" * 70)
    logger.info(f"Loading data from: {csv_path}")
    
    # Load checkpoint
    if reset:
        logger.info("🔄 Reset flag set - Starting from beginning")
        if checkpoint_file.exists():
            checkpoint_file.unlink()
        checkpoint = {"last_indexed": 0, "total_documents": 0}
    else:
        checkpoint = load_checkpoint(checkpoint_file)
    
    # Determine starting point
    if start_from is not None:
        start_index = start_from
        logger.info(f"▶️  Starting from document {start_index} (manual override)")
    else:
        start_index = checkpoint.get("last_indexed", 0)
        if start_index > 0:
            logger.info(f"▶️  Resuming from document {start_index}")
        else:
            logger.info(f"▶️  Starting fresh indexing")
    
    try:
        # Read CSV file
        df = pd.read_csv(csv_path, encoding='utf-8')
        total_docs = len(df)
        logger.info(f"✅ Loaded {total_docs} documents from CSV")
        logger.info(f"Columns: {df.columns.tolist()}")
        
        # Skip already indexed documents
        if start_index > 0:
            if start_index >= total_docs:
                logger.info(f"✅ All documents already indexed ({start_index}/{total_docs})")
                return
            df = df.iloc[start_index:].reset_index(drop=True)
            logger.info(f"📋 Processing remaining {len(df)} documents (skipped {start_index})")
        
        # Prepare documents for indexing
        documents = []
        
        for idx, row in df.iterrows():
            actual_idx = start_index + idx  # Track actual document index
            
            # Build content from all available fields
            content_parts = []
            
            # Iterate through all columns and add non-empty values
            for col in df.columns:
                value = row[col]
                if pd.notna(value) and str(value).strip():
                    # Format the content nicely
                    content_parts.append(f"{col}: {value}")
            
            content = "\n".join(content_parts)
            
            # Create metadata
            metadata = {
                "doc_index": actual_idx,
                "source": "vietnamese_law_corpus",
                "dataset": "kiil-lab/vietnamese-law-corpus"
            }
            
            # Add key fields to metadata
            for field in df.columns:
                if field in row and pd.notna(row[field]):
                    field_value = str(row[field])
                    if len(field_value) <= 200:
                        metadata[field] = field_value
                    else:
                        metadata[f"{field}_preview"] = field_value[:200] + "..."
            
            documents.append({
                "content": content,
                "metadata": metadata
            })
            
            # Log progress every 100 documents
            if (actual_idx + 1) % 100 == 0:
                logger.info(f"Prepared {actual_idx + 1}/{total_docs} documents...")
        
        logger.info(f"✅ Prepared {len(documents)} documents for indexing (total progress: {start_index + len(documents)}/{total_docs})")
        
        # Get RAG service and index documents
        rag_service = get_rag_service()
        
        # Index in batches
        batch_size = 20
        total_chunks = 0
        failed_batches = 0
        total_batches = (len(documents) + batch_size - 1) // batch_size
        
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            batch_num = i // batch_size + 1
            current_doc_index = start_index + i + len(batch)
            
            logger.info(f"Indexing batch {batch_num}/{total_batches} (docs {start_index + i + 1}-{current_doc_index})...")
            
            result = await rag_service.index_documents(batch)
            
            if result.get("success"):
                chunks = result.get("chunks_created", 0)
                total_chunks += chunks
                logger.info(f"  ✅ Batch {batch_num}: {chunks} chunks indexed")
                save_checkpoint(checkpoint_file, current_doc_index, total_docs)
            else:
                failed_batches += 1
                logger.error(f"  ❌ Batch {batch_num} failed: {result.get('error')}")
        
        # Summary
        final_indexed = start_index + len(documents)
        logger.info("\n" + "=" * 70)
        logger.info("INDEXING SUMMARY")
        logger.info("=" * 70)
        logger.info(f"Documents in this run: {len(documents)}")
        logger.info(f"Total indexed so far:  {final_indexed}/{total_docs} ({final_indexed/total_docs*100:.1f}%)")
        logger.info(f"Chunks created:        {total_chunks}")
        logger.info(f"Successful batches:    {total_batches - failed_batches}/{total_batches}")
        logger.info(f"Failed batches:        {failed_batches}")
        
        if final_indexed >= total_docs:
            logger.info("Status:                ✅ COMPLETED")
            if checkpoint_file.exists():
                checkpoint_file.unlink()
                logger.info("🗑️  Checkpoint file removed (indexing complete)")
        elif failed_batches == 0:
            logger.info("Status:                ✅ SUCCESS (can resume later)")
        else:
            logger.warning(f"Status:                ⚠️  PARTIAL SUCCESS")
        
        logger.info("=" * 70)
        
        if final_indexed < total_docs:
            remaining = total_docs - final_indexed
            logger.info(f"\n💡 To continue indexing remaining {remaining} documents, run:")
            logger.info(f"   python3 -m app.utils.index_vietnamese_law_data")
        
    except Exception as e:
        logger.error(f"❌ Error during indexing: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Index Vietnamese Law Corpus with checkpoint support')
    parser.add_argument('--reset', action='store_true', help='Reset checkpoint and start from beginning')
    parser.add_argument('--start-from', type=int, help='Start indexing from specific document number')
    args = parser.parse_args()
    
    logger.info("Starting Vietnamese Law Corpus indexing...")
    if args.reset:
        logger.info("🔄 Resetting checkpoint...")
    if args.start_from is not None:
        logger.info(f"▶️  Starting from document {args.start_from}")
    
    asyncio.run(index_vietnamese_law_corpus(start_from=args.start_from, reset=args.reset))
