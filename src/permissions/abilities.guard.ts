import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability-factory';
import { CHECK_ABILITY } from './check.ability.guard';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const abilityData = this.reflector.getAllAndOverride(CHECK_ABILITY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!abilityData) return true; // route nemá @CheckAbility → povolíme

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    const ability = this.caslAbilityFactory.createForUser(user);

    if (ability.can(abilityData.action, abilityData.subject)) {
      return true;
    }

    throw new ForbiddenException(
      `You are not allowed to ${abilityData.action} ${abilityData.subject}`,
    );
  }
}
