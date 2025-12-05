import { ChatQARepository } from '../../domain/interfaces/repositories';
import { ChatQARequest, ChatQAResponse } from '../../domain/entities';

export class HttpChatQARepository implements ChatQARepository {
  private pythonApiURL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

  async askQuestion(request: ChatQARequest): Promise<ChatQAResponse> {
    const { question, top_k = 5 } = request;
    
    console.log('Sending Chat Q/A request:', {
      url: `${this.pythonApiURL}/dataset-rag/ask`,
      question,
      top_k
    });

    const response = await fetch(`${this.pythonApiURL}/dataset-rag/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        top_k
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat Q/A API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('Chat Q/A result:', result);
    return result;
  }
}
