import { PostReportUseCases } from '@/application/use-cases/post-report.use-case';
import { postReportRepository } from '@/infrastructure/repositories/post-report.repository';
import { useMemo } from 'react';

const postReportUseCases = new PostReportUseCases(postReportRepository);

export const usePostReportCases = () => {
  return useMemo(
    () => ({
      createReport: postReportUseCases.createReport.bind(postReportUseCases),
      checkUserReported: postReportUseCases.checkUserReported.bind(postReportUseCases),
      getUserReports: postReportUseCases.getUserReports.bind(postReportUseCases),
      getAllReports: postReportUseCases.getAllReports.bind(postReportUseCases),
      getReportsByStatus: postReportUseCases.getReportsByStatus.bind(postReportUseCases),
      getReportById: postReportUseCases.getReportById.bind(postReportUseCases),
      updateReportStatus: postReportUseCases.updateReportStatus.bind(postReportUseCases),
      countPendingReports: postReportUseCases.countPendingReports.bind(postReportUseCases),
      getReportsByPostId: postReportUseCases.getReportsByPostId.bind(postReportUseCases),
    }),
    []
  );
};

