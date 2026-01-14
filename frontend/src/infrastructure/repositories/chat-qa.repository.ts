import { ChatQARepository } from "../../domain/interfaces/repositories";
import { ChatQARequest, ChatQAResponse } from "../../domain/entities";

export class HttpChatQARepository implements ChatQARepository {
  private pythonApiURL =
    process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://legal-connect-prod-alb-790910672.ap-southeast-1.elb.amazonaws.com";

  async askQuestion(request: ChatQARequest): Promise<ChatQAResponse> {
    const { question, top_k = 5, conversation_id, chat_history } = request;

    console.log("Sending Chat Q/A request:", {
      url: `${this.pythonApiURL}/rag/ask`,
      question,
      top_k,
      conversation_id,
      chat_history_length: chat_history?.length || 0,
    });

    const response = await fetch(`${this.pythonApiURL}/rag/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        top_k,
        conversation_id: conversation_id ? String(conversation_id) : undefined,
        chat_history,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Chat Q/A API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Chat Q/A result:", result);
    return result;
  }
}
