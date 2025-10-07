import { useCallback } from 'react';
import { container } from '@/infrastructure/container';
import { LawyerRepository } from '@/domain/interfaces/repositories';
import { LawyerApplication } from '@/domain/entities';

export const useLawyerCases = () => {
  const lawyerRepository = container.getRepository<LawyerRepository>('LawyerRepository');

  const uploadDocuments = useCallback(async (files: File[]): Promise<string[] | null> => {
    try {
      return await lawyerRepository.uploadDocuments(files);
    } catch (error) {
      console.error('Error uploading documents:', error);
      return null;
    }
  }, [lawyerRepository]);

  const submitApplication = useCallback(async (application: {
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
  }): Promise<LawyerApplication | null> => {
    try {
      return await lawyerRepository.submitApplication(application);
    } catch (error) {
      console.error('Error submitting application:', error);
      return null;
    }
  }, [lawyerRepository]);

  const getUserApplication = useCallback(async (): Promise<LawyerApplication | null> => {
    try {
      return await lawyerRepository.getUserApplication();
    } catch (error) {
      console.error('Error fetching user application:', error);
      return null;
    }
  }, [lawyerRepository]);

  const canUserApply = useCallback(async (): Promise<boolean> => {
    try {
      return await lawyerRepository.canUserApply();
    } catch (error) {
      console.error('Error checking if user can apply:', error);
      return false;
    }
  }, [lawyerRepository]);

  const hasUserApplied = useCallback(async (): Promise<boolean> => {
    try {
      return await lawyerRepository.hasUserApplied();
    } catch (error) {
      console.error('Error checking if user has applied:', error);
      return false;
    }
  }, [lawyerRepository]);

  const updateApplicationDocuments = useCallback(async (
    applicationId: number, 
    documentUrls: string[]
  ): Promise<LawyerApplication | null> => {
    try {
      return await lawyerRepository.updateApplicationDocuments(applicationId, documentUrls);
    } catch (error) {
      console.error('Error updating application documents:', error);
      return null;
    }
  }, [lawyerRepository]);

  const deleteApplication = useCallback(async (applicationId: number): Promise<boolean> => {
    try {
      await lawyerRepository.deleteApplication(applicationId);
      return true;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }, [lawyerRepository]);

  return {
    uploadDocuments,
    submitApplication,
    getUserApplication,
    canUserApply,
    hasUserApplied,
    updateApplicationDocuments,
    deleteApplication,
  };
};