import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingsModule {}
