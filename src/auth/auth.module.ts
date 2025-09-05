import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RolesModule } from 'src/roles/roles.module';
import { AccessControlService } from 'src/roles/access-control.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    RolesModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AccessControlService],
})
export class AuthModule {}
