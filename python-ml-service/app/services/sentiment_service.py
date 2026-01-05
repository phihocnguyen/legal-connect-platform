from typing import List, Dict, Union
from transformers import pipeline
from loguru import logger
from datetime import datetime
import torch

class SentimentService:
    """Service for Sentiment Analysis using HuggingFace Transformers"""
    
    def __init__(self):
        self.model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
        self.classifier = None
        # Danh sách từ khóa chửi bới/xúc phạm thực sự (Insults/Swearing)
        # Loại bỏ "mày", "tao", "tệ" để tránh bắt nhầm câu hội thoại hoặc feedback
        self.toxic_keywords = [
            "ngu", "chó", "đmm", "đm", "vcl", "cl", "cút", 
            "dốt", "điên", "khùng", "đéo", "đĩ", "mẹ mày",
            "khốn nạn", "vô học", "mất dạy", "láo",
            "lừa đảo", "súc vật", "ngu học", "đần"
        ]
        self._initialize()
    
    def _initialize(self):
        """Initialize the sentiment analysis pipeline"""
        try:
            logger.info(f"Initializing Sentiment Service with model: {self.model_name}")
            # Check if GPU is available
            device = 0 if torch.cuda.is_available() else -1
            
            self.classifier = pipeline(
                "sentiment-analysis",
                model=self.model_name,
                device=device
            )
            logger.info("✅ Sentiment Service initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Sentiment Service: {e}")
            raise

    def analyze_text(self, text: str) -> Dict[str, Union[str, float]]:
        """
        Analyze the sentiment of a single text.
        Returns a dict with sentiment (positive, negative, neutral) and confidence score.
        """
        if not self.classifier:
            return {"error": "Sentiment classifier not initialized"}
        
        try:
            # The model returns labels like '1 star', '2 stars', ..., '5 stars'
            result = self.classifier(text)[0]
            label = result['label']  # e.g., "1 star", "5 stars"
            score = result['score']
            
            # Map stars to sentiment
            # 1-2 stars: negative
            # 3 stars: neutral
            # 4-5 stars: positive
            
            sentiment = "neutral"
            if label in ["1 star", "2 stars"]:
                sentiment = "negative"
            elif label in ["4 stars", "5 stars"]:
                sentiment = "positive"
                
            # TỐI ƯU CHO TIẾNG VIỆT: Overriding BERT results with keyword detection
            text_lower = text.lower()
            has_toxic = any(word in text_lower for word in self.toxic_keywords)
            
            if has_toxic:
                if sentiment != "negative":
                    logger.warning(f"⚠️ BERT predicted '{sentiment}' ({label}), but toxic keywords detected in: '{text}'. Overriding to 'negative'.")
                    sentiment = "negative"
                else:
                    logger.info(f"Toxic keywords confirmed negative sentiment for: '{text}'")

            return {
                "text": text,
                "sentiment": sentiment,
                "label": label,
                "score": score,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            return {"error": str(e)}

    def analyze_batch(self, texts: List[str]) -> List[Dict[str, Union[str, float]]]:
        """Analyze a batch of texts"""
        return [self.analyze_text(text) for text in texts]

# Singleton instance
_sentiment_service = None

def get_sentiment_service() -> SentimentService:
    global _sentiment_service
    if _sentiment_service is None:
        _sentiment_service = SentimentService()
    return _sentiment_service
