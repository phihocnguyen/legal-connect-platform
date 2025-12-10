import { PostLabelDto } from "@/domain/entities";
import { ILabelRepository } from "@/infrastructure/repositories/label.repository";

export class CreateLabelUseCase {
  constructor(private labelRepository: ILabelRepository) {}

  async execute(labelData: Partial<PostLabelDto>): Promise<PostLabelDto> {
    return await this.labelRepository.createLabel(labelData);
  }
}

export class UpdateLabelUseCase {
  constructor(private labelRepository: ILabelRepository) {}

  async execute(
    id: string,
    labelData: Partial<PostLabelDto>
  ): Promise<PostLabelDto> {
    return await this.labelRepository.updateLabel(id, labelData);
  }
}

export class DeleteLabelUseCase {
  constructor(private labelRepository: ILabelRepository) {}

  async execute(id: string): Promise<void> {
    return await this.labelRepository.deleteLabel(id);
  }
}
