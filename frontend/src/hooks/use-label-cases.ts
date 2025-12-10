import { useCallback } from "react";
import { container } from "@/infrastructure/container";
import {
  CreateLabelUseCase,
  UpdateLabelUseCase,
  DeleteLabelUseCase,
} from "@/application/use-cases/label.use-cases";
import { PostLabelDto } from "@/domain/entities";

export const useLabelUseCases = () => {
  const createLabel = useCallback(
    async (labelData: Partial<PostLabelDto>): Promise<PostLabelDto> => {
      const useCase =
        container.getUseCase<CreateLabelUseCase>("CreateLabelUseCase");
      return await useCase.execute(labelData);
    },
    []
  );

  const updateLabel = useCallback(
    async (
      id: string,
      labelData: Partial<PostLabelDto>
    ): Promise<PostLabelDto> => {
      const useCase =
        container.getUseCase<UpdateLabelUseCase>("UpdateLabelUseCase");
      return await useCase.execute(id, labelData);
    },
    []
  );

  const deleteLabel = useCallback(async (id: string): Promise<void> => {
    const useCase =
      container.getUseCase<DeleteLabelUseCase>("DeleteLabelUseCase");
    return await useCase.execute(id);
  }, []);

  return {
    createLabel,
    updateLabel,
    deleteLabel,
  };
};
