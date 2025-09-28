import { Module } from '@nestjs/common';
import { RatingController } from './ratings.controller';
import { RatingService } from './ratings.service';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [DatabaseModule],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingsModule {}
