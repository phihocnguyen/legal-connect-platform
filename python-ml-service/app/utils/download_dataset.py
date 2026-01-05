#!/usr/bin/env python3
"""
Download Vietnamese Law Corpus from HuggingFace
Dataset: kiil-lab/vietnamese-law-corpus
"""

import os
import pandas as pd
from pathlib import Path
from loguru import logger

try:
    from datasets import load_dataset
except ImportError:
    logger.error("Please install datasets: pip install datasets")
    exit(1)


def download_vietnamese_law_corpus():
    """Download and save Vietnamese Law Corpus as CSV"""
    
    logger.info("=" * 70)
    logger.info("Vietnamese Law Corpus Downloader")
    logger.info("=" * 70)
    
    # Output directory
    output_dir = Path(__file__).parent.parent / "data"
    output_dir.mkdir(exist_ok=True)
    
    try:
        logger.info("Downloading dataset from HuggingFace...")
        logger.info("Dataset: kiil-lab/vietnamese-law-corpus")
        logger.info("This may take a few minutes...")
        
        # Load dataset
        ds = load_dataset("kiil-lab/vietnamese-law-corpus")
        
        logger.info(f"✅ Dataset loaded successfully!")
        logger.info(f"Available splits: {list(ds.keys())}")
        
        # Process each split
        for split_name, split_data in ds.items():
            logger.info(f"\nProcessing split: {split_name}")
            logger.info(f"Number of examples: {len(split_data)}")
            
            # Convert to pandas DataFrame
            df = pd.DataFrame(split_data)
            
            # Display info
            logger.info(f"Columns: {df.columns.tolist()}")
            logger.info(f"Shape: {df.shape}")
            
            # Save as CSV
            output_file = output_dir / f"vietnamese_law_corpus_{split_name}.csv"
            df.to_csv(output_file, index=False, encoding='utf-8')
            
            logger.info(f"✅ Saved to: {output_file}")
            
            # Display sample
            if len(df) > 0:
                logger.info(f"\nSample data from {split_name}:")
                logger.info(df.head(2).to_string())
        
        # Save combined dataset
        logger.info("\n" + "=" * 70)
        logger.info("Creating combined dataset...")
        
        all_data = []
        for split_name in ds.keys():
            all_data.append(pd.DataFrame(ds[split_name]))
        
        combined_df = pd.concat(all_data, ignore_index=True)
        combined_output = output_dir / "vietnamese_law_corpus_combined.csv"
        combined_df.to_csv(combined_output, index=False, encoding='utf-8')
        
        logger.info(f"✅ Combined dataset saved to: {combined_output}")
        logger.info(f"Total records: {len(combined_df)}")
        
        logger.info("\n" + "=" * 70)
        logger.info("Dataset Statistics:")
        logger.info("=" * 70)
        logger.info(f"Total records: {len(combined_df)}")
        logger.info(f"Columns: {combined_df.columns.tolist()}")
        logger.info(f"Memory usage: {combined_df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB")
        
        # Show column info
        logger.info("\nColumn info:")
        for col in combined_df.columns:
            non_null = combined_df[col].notna().sum()
            logger.info(f"  - {col}: {non_null}/{len(combined_df)} non-null")
        
        logger.info("\n✅ Download completed successfully!")
        logger.info(f"📁 Files saved in: {output_dir}")
        
    except Exception as e:
        logger.error(f"❌ Error downloading dataset: {e}")
        logger.error("Make sure you have:")
        logger.error("1. Installed datasets: pip install datasets")
        logger.error("2. Login to HuggingFace: huggingface-cli login")
        raise


if __name__ == "__main__":
    download_vietnamese_law_corpus()
