import { User } from '../../domain/entities';
import { AuthRepository } from '../../domain/interfaces/repositories';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<{ user: User }> {
    return this.authRepository.login(email, password);
  }
}

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(data: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User }> {
    return this.authRepository.register(data);
  }
}

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}

export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}
