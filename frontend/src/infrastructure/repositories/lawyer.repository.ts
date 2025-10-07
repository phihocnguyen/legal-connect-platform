import { LawyerRepository } from '../../domain/interfaces/repositories';
import { LawyerApplication } from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';

export class HttpLawyerRepository implements LawyerRepository {
  
  /**
   * Upload documents for lawyer application
   */
  async uploadDocuments(files: File[]): Promise<string[]> {
    const formData = new FormData();
    
    for (const file of files) {
      formData.append('files', file);
    }

    const response = await apiClient.post('/upload/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data as string[];
    }
    
    throw new Error(apiResponse.message || 'Failed to upload documents');
  }

  /**
   * Submit lawyer application
   */
  async submitApplication(application: {
    licenseNumber: string;
    lawSchool: string;
    graduationYear: number;
    specializations: string[];
    yearsOfExperience: number;
    currentFirm: string;
    bio: string;
    phoneNumber: string;
    officeAddress: string;
    documentUrls: string[];
  }): Promise<LawyerApplication> {
    console.log('LawyerRepository - Submitting application:', {
      ...application,
      bio: `Bio length: ${application.bio.length}, first 50 chars: "${application.bio.substring(0, 50)}"`
    });
    
    const response = await apiClient.post('/lawyer/apply', application);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data as LawyerApplication;
    }
    
    throw new Error(apiResponse.message || 'Failed to submit application');
  }

  /**
   * Get current user's lawyer application
   */
  async getUserApplication(): Promise<LawyerApplication | null> {
    try {
      const response = await apiClient.get('/lawyer/application');
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data as LawyerApplication;
      }
      
      return null;
    } catch {
      // If no application found, return null instead of throwing error
      return null;
    }
  }

  /**
   * Check if current user can apply to become a lawyer
   */
  async canUserApply(): Promise<boolean> {
    const response = await apiClient.get('/lawyer/can-apply');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success) {
      return apiResponse.data as boolean;
    }
    
    return false;
  }

  /**
   * Check if current user has already applied
   */
  async hasUserApplied(): Promise<boolean> {
    const response = await apiClient.get('/lawyer/has-applied');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success) {
      return apiResponse.data as boolean;
    }
    
    return false;
  }

  /**
   * Update application documents
   */
  async updateApplicationDocuments(applicationId: number, documentUrls: string[]): Promise<LawyerApplication> {
    const response = await apiClient.put(`/lawyer/application/${applicationId}/documents`, documentUrls);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data as LawyerApplication;
    }
    
    throw new Error(apiResponse.message || 'Failed to update application documents');
  }

  /**
   * Delete lawyer application
   */
  async deleteApplication(applicationId: number): Promise<void> {
    const response = await apiClient.delete(`/lawyer/application/${applicationId}`);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to delete application');
    }
  }
}