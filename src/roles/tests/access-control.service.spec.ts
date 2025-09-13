import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlService } from '../access-control.service';
import { Role } from '../utils/roles';

describe('AccessControlService', () => {
  let service: AccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControlService],
    }).compile();

    service = module.get<AccessControlService>(AccessControlService);
  });

  describe('isAuthorized', () => {
    describe('when roles are valid', () => {
      it('should allow ADMIN to access ADMIN resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.ADMIN,
          requiredRole: Role.ADMIN,
        });

        expect(result).toBe(true);
      });

      it('should allow ADMIN to access TEACHER resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.ADMIN,
          requiredRole: Role.TEACHER,
        });

        expect(result).toBe(true);
      });

      it('should allow ADMIN to access STUDENT resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.ADMIN,
          requiredRole: Role.STUDENT,
        });

        expect(result).toBe(true);
      });

      it('should allow TEACHER to access TEACHER resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.TEACHER,
          requiredRole: Role.TEACHER,
        });

        expect(result).toBe(true);
      });

      it('should allow TEACHER to access STUDENT resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.TEACHER,
          requiredRole: Role.STUDENT,
        });

        expect(result).toBe(true);
      });

      it('should allow STUDENT to access STUDENT resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.STUDENT,
          requiredRole: Role.STUDENT,
        });

        expect(result).toBe(true);
      });

      it('should deny STUDENT access to TEACHER resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.STUDENT,
          requiredRole: Role.TEACHER,
        });

        expect(result).toBe(false);
      });

      it('should deny STUDENT access to ADMIN resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.STUDENT,
          requiredRole: Role.ADMIN,
        });

        expect(result).toBe(false);
      });

      it('should deny TEACHER access to ADMIN resources', () => {
        const result = service.isAuthorized({
          currentRole: Role.TEACHER,
          requiredRole: Role.ADMIN,
        });

        expect(result).toBe(false);
      });
    });

    describe('when roles are invalid', () => {
      it('should return false when currentRole is undefined', () => {
        const result = service.isAuthorized({
          currentRole: undefined as any,
          requiredRole: Role.STUDENT,
        });

        expect(result).toBe(false);
      });

      it('should return false when requiredRole is undefined', () => {
        const result = service.isAuthorized({
          currentRole: Role.ADMIN,
          requiredRole: undefined as any,
        });

        expect(result).toBe(false);
      });

      it('should return false when both roles are undefined', () => {
        const result = service.isAuthorized({
          currentRole: undefined as any,
          requiredRole: undefined as any,
        });

        expect(result).toBe(false);
      });

      it('should return false when currentRole is not in rolePriority', () => {
        const result = service.isAuthorized({
          currentRole: 'INVALID_ROLE' as Role,
          requiredRole: Role.STUDENT,
        });

        expect(result).toBe(false);
      });

      it('should return false when requiredRole is not in rolePriority', () => {
        const result = service.isAuthorized({
          currentRole: Role.ADMIN,
          requiredRole: 'INVALID_ROLE' as Role,
        });

        expect(result).toBe(false);
      });

      it('should return false when both roles are invalid', () => {
        const result = service.isAuthorized({
          currentRole: 'INVALID_CURRENT' as Role,
          requiredRole: 'INVALID_REQUIRED' as Role,
        });

        expect(result).toBe(false);
      });
    });

    describe('role hierarchy validation', () => {
      it('should maintain correct priority order: ADMIN > TEACHER > STUDENT', () => {
        // Test all combinations systematically
        const roles = [Role.STUDENT, Role.TEACHER, Role.ADMIN];
        const priorities = [1, 2, 3];

        roles.forEach((currentRole, currentIndex) => {
          roles.forEach((requiredRole, requiredIndex) => {
            const result = service.isAuthorized({ currentRole, requiredRole });
            const shouldBeAuthorized =
              priorities[currentIndex] >= priorities[requiredIndex];

            expect(result).toBe(shouldBeAuthorized);
          });
        });
      });
    });
  });

  describe('service instantiation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of AccessControlService', () => {
      expect(service).toBeInstanceOf(AccessControlService);
    });
  });
});
