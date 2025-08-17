import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard {
  constructor(private roles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    if (this.roles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(`Only ${this.roles.join(', ')} allowed`);
  }
}

export class StudentGuard extends RolesGuard {
  constructor(private prisma: PrismaService) {
    super([Role.STUDENT]);
  }
}

export class TeacherGuard extends RolesGuard {
  constructor(private prisma: PrismaService) {
    super([Role.TEACHER]);
  }
}

export class AdminGuard extends RolesGuard {
  constructor(private prisma: PrismaService) {
    super([Role.ADMIN]);
  }
}
