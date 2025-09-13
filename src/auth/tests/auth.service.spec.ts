import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AccessControlService } from 'src/roles/access-control.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/utils/roles';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let accessControlService: AccessControlService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: { id: 1, name: Role.STUDENT },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
            token: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signedToken'),
          },
        },
        {
          provide: AccessControlService,
          useValue: {
            isAuthorized: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    accessControlService = module.get<AccessControlService>(AccessControlService);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue({ id: 1, name: Role.STUDENT });
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as any);

      const result = await service.register({ email: 'test@example.com', name: 'Test', password: '123456' });

      expect(result).toEqual({ access_token: 'signedToken', refresh_token: 'signedToken' });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw if email is already in use', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(
        service.register({ email: 'test@example.com', name: 'Test', password: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if unauthorized to assign role', async () => {
      jest.spyOn(accessControlService, 'isAuthorized').mockReturnValue(false);

      await expect(
        service.register({ email: 'test@example.com', name: 'Test', password: '123456', role: Role.ADMIN }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return tokens if credentials are correct', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: '123456' });

      expect(result).toEqual({ access_token: 'signedToken', refresh_token: 'signedToken' });
    });

    it('should throw if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@example.com', password: '123456' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password is invalid', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('profile', () => {
    it('should return user profile', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.profile(1);

      expect(result).toEqual(mockUser);
    });
  });
});
