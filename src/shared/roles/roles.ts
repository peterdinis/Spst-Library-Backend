import { Role as PrismaRole } from '@prisma/client';

export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export function toDomainRole(role: PrismaRole): Role {
  return Role[role as keyof typeof Role];
}

export function toPrismaRole(role: Role): PrismaRole {
  return role as unknown as PrismaRole;
}