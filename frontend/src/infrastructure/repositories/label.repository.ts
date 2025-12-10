import axiosInstance from "@/lib/axiosInstance";
import { PostLabelDto } from "@/domain/entities";

export interface ILabelRepository {
  createLabel(labelData: Partial<PostLabelDto>): Promise<PostLabelDto>;
  updateLabel(
    id: string,
    labelData: Partial<PostLabelDto>
  ): Promise<PostLabelDto>;
  deleteLabel(id: string): Promise<void>;
}

export class LabelRepository implements ILabelRepository {
  async createLabel(labelData: Partial<PostLabelDto>): Promise<PostLabelDto> {
    const response = await axiosInstance.post("/api/labels", labelData);
    return response.data;
  }

  async updateLabel(
    id: string,
    labelData: Partial<PostLabelDto>
  ): Promise<PostLabelDto> {
    const response = await axiosInstance.put(`/api/labels/${id}`, labelData);
    return response.data;
  }

  async deleteLabel(id: string): Promise<void> {
    await axiosInstance.delete(`/api/labels/${id}`);
  }
}
