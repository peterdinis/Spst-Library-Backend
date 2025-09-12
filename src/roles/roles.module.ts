import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [AccessControlService, RolesService],
  exports: [AccessControlService],
})
export class RolesModule {}
