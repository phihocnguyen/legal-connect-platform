import { useState, useCallback } from 'react';
import { AdminDashboardRepository, AdminDashboardStats } from '../infrastructure/repositories/admin-dashboard.repository';
import { toast } from 'sonner';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const repository = new AdminDashboardRepository();
      const data = await repository.getDashboardStats();
      setStats(data);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    return await fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    fetchDashboardStats,
    refreshStats,
  };
};