import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../access-control.service';
import { ROLE_KEY } from '../decorators/roles.decorator';
import { Role } from '../utils/roles';
import { TokenDto } from '../dto/token.dto';

function mapPrismaRoleToEnum(prismaRoleName: string): Role {
  switch (prismaRoleName) {
    case 'ADMIN':
      return Role.ADMIN;
    case 'TEACHER':
      return Role.TEACHER;
    case 'STUDENT':
      return Role.STUDENT;
    default:
      throw new Error(`Unknown role name: ${prismaRoleName}`);
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.user as TokenDto;

    if (!token) {
      throw new ForbiddenException('User not authenticated');
    }

    const currentRoleEnum = mapPrismaRoleToEnum(token.role);

    const hasAccess = requiredRoles.some((requiredRole) =>
      this.accessControlService.isAuthorized({
        currentRole: currentRoleEnum,
        requiredRole: requiredRole,
      }),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
