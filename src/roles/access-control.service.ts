import { Injectable } from '@nestjs/common';
import { Role } from './utils/roles';

interface IsAuthorizedParams {
  currentRole: Role;
  requiredRole: Role;
}

@Injectable()
export class AccessControlService {
  // Assign numeric priority to each role
  private rolePriority: Record<Role, number> = {
    STUDENT: 1,
    TEACHER: 2,
    ADMIN: 3,
  };

  /**
   * Checks if the current role has sufficient priority to access a resource
   * @param params - { currentRole, requiredRole }
   * @returns boolean
   */
  public isAuthorized({ currentRole, requiredRole }: IsAuthorizedParams): boolean {
    const currentPriority = this.rolePriority[currentRole];
    const requiredPriority = this.rolePriority[requiredRole];

    if (currentPriority === undefined || requiredPriority === undefined) {
      return false;
    }

    return currentPriority >= requiredPriority;
  }
}
