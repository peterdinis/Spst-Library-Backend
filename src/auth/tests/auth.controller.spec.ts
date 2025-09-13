import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from 'src/roles/utils/roles';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockTokens = { access_token: 'access', refresh_token: 'refresh' };
  const mockProfile = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: { id: 1, name: Role.STUDENT },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockTokens),
            login: jest.fn().mockResolvedValue(mockTokens),
            refreshToken: jest.fn().mockResolvedValue(mockTokens),
            revokeTokens: jest.fn().mockResolvedValue(undefined),
            profile: jest.fn().mockResolvedValue(mockProfile),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call AuthService.register and return tokens', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: '123456' };
      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return tokens', async () => {
      const dto = { email: 'test@example.com', password: '123456' };
      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refresh', () => {
    it('should call AuthService.refreshToken and return tokens', async () => {
      const body = { userId: 1, refreshToken: 'refreshToken' };
      const result = await controller.refresh(body);

      expect(authService.refreshToken).toHaveBeenCalledWith(body.userId, body.refreshToken);
      expect(result).toEqual(mockTokens);
    });

    it('should throw if AuthService.refreshToken throws', async () => {
      jest.spyOn(authService, 'refreshToken').mockRejectedValueOnce(new UnauthorizedException());

      await expect(controller.refresh({ userId: 1, refreshToken: 'invalid' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should call AuthService.revokeTokens and return success message', async () => {
      const req = { user: { id: 1 } };
      const result = await controller.logout(req);

      expect(authService.revokeTokens).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('profile', () => {
    it('should call AuthService.profile and return user profile', async () => {
      const req = { user: { id: 1 } };
      const result = await controller.profile(req);

      expect(authService.profile).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('adminOnly', () => {
    it('should return admin-only message', () => {
      const result = controller.adminOnly();
      expect(result).toEqual({ message: 'This is an admin-only route' });
    });
  });
});
