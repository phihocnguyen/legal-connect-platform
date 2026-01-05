#!/bin/bash

# Setup script for downloading Vietnamese Law Corpus

echo "🚀 Vietnamese Law Corpus Downloader"
echo "===================================="
echo ""

# Check if in correct directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from python-ml-service directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install datasets huggingface-hub

echo ""
echo "🔑 HuggingFace Login"
echo "If you haven't logged in yet, please run:"
echo "  huggingface-cli login"
echo ""
read -p "Have you logged in to HuggingFace? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please login first:"
    echo "  huggingface-cli login"
    exit 1
fi

# Download dataset
echo ""
echo "📥 Downloading Vietnamese Law Corpus..."
python -m app.utils.download_dataset

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Check downloaded CSV files in app/data/"
echo "2. Run indexing script to add data to ChromaDB"
echo "   python -m app.utils.index_vietnamese_law_data"
