import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret123',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [TeachersController],
  providers: [TeachersService, JwtAuthGuard],
})
export class TeachersModule {}
