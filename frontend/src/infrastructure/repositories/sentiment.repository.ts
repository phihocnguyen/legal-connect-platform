export interface SentimentAnalysisRequest {
  text: string;
}

export interface SentimentAnalysisResponse {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  label: string;
  score: number;
  timestamp: string;
}

export interface BatchSentimentAnalysisRequest {
  texts: string[];
}

export interface BatchSentimentAnalysisResponse {
  results: SentimentAnalysisResponse[];
}

export class SentimentRepository {
  private pythonApiURL =
    process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

  async analyzeSentiment(text: string): Promise<SentimentAnalysisResponse> {
    const response = await fetch(`${this.pythonApiURL}/sentiment/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return await response.json();
  }

  async analyzeSentimentBatch(texts: string[]): Promise<BatchSentimentAnalysisResponse> {
    const response = await fetch(`${this.pythonApiURL}/sentiment/analyze-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return await response.json();
  }
}

export const sentimentRepository = new SentimentRepository();
