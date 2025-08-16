import { Injectable } from '@nestjs/common';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import { Account, Role } from '@prisma/client';

export enum Actions {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | 'Account'
  | 'Author'
  | 'Book'
  | 'Category'
  | 'Order'
  | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: Account) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    switch (user.role) {
      case Role.STUDENT:
        can(Actions.Read, 'Author');
        can(Actions.Read, 'Category');
        can(Actions.Read, 'Book');
        can(Actions.Create, 'Order');
        cannot(Actions.Create, 'Author');
        cannot(Actions.Update, 'Author');
        cannot(Actions.Delete, 'Author');
        cannot(Actions.Create, 'Book');
        cannot(Actions.Update, 'Book');
        cannot(Actions.Delete, 'Book');
        cannot(Actions.Create, 'Category');
        cannot(Actions.Update, 'Category');
        cannot(Actions.Delete, 'Category');
        break;

      case Role.TEACHER:
        can(Actions.Read, 'Author');
        can(Actions.Read, 'Category');
        can(Actions.Read, 'Book');

        can(Actions.Create, 'Book');
        can(Actions.Update, 'Book');

        can(Actions.Create, 'Order');
        can(Actions.Read, 'Order');
        can(Actions.Update, 'Order');
        break;

      case Role.ADMIN:
        can(Actions.Manage, 'all');
        break;
    }

    return build({
      detectSubjectType: (item: any) =>
        item?.__typename ??
        (item?.constructor?.name as ExtractSubjectType<Subjects>),
    });
  }
}
