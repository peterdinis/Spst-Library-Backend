import { SetMetadata } from '@nestjs/common';
import { Actions, Subjects } from '../casl/casl-ability-factory';

export const CHECK_ABILITY = 'check_ability';
export const CheckAbility = (action: Actions, subject: Subjects) =>
  SetMetadata(CHECK_ABILITY, { action, subject });
