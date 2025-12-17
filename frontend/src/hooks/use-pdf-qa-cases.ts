import { useCallback } from "react";
import { container } from "@/infrastructure/container";
import { AskPdfQuestionUseCase } from "@/application/use-cases/pdf.use-case";

export const usePdfQACases = () => {
  const askPdfQuestionUseCase = container.getUseCase<AskPdfQuestionUseCase>(
    "AskPdfQuestionUseCase"
  );

  const askPdfQuestion = useCallback(
    async (fileId: string, question: string, topK?: number) => {
      return askPdfQuestionUseCase.execute(fileId, question, topK);
    },
    [askPdfQuestionUseCase]
  );

  return {
    askPdfQuestion,
  };
};
