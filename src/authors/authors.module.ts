import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { AdminGuard, TeacherGuard } from 'src/permissions/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 60, // default cache time-to-live (in seconds)
      max: 100, // max items (if in-memory)
    }),
  ],
  providers: [AuthorsService, TeacherGuard, AdminGuard],
  controllers: [AuthorsController]
})
export class AuthorsModule {}
