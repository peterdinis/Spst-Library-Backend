import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';

@Module({
  imports: [PrismaModule],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingModule {}
