import { useCallback } from 'react';
import { container } from '../infrastructure/container';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from '../application/use-cases/auth.use-case';

export function useAuthUseCases() {
  const login = useCallback((email: string, password: string) => {
    const useCase = container.getUseCase<LoginUseCase>('LoginUseCase');
    return useCase.execute(email, password);
  }, []);

  const register = useCallback(
    (data: { email: string; password: string; fullName: string }) => {
      const useCase = container.getUseCase<RegisterUseCase>('RegisterUseCase');
      return useCase.execute(data);
    },
    []
  );

  const logout = useCallback(() => {
    const useCase = container.getUseCase<LogoutUseCase>('LogoutUseCase');
    return useCase.execute();
  }, []);

  const getCurrentUser = useCallback(() => {
    const useCase = container.getUseCase<GetCurrentUserUseCase>('GetCurrentUserUseCase');
    return useCase.execute();
  }, []);

  return {
    login,
    register,
    logout,
    getCurrentUser,
  };
}
