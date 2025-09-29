import { Module } from '@nestjs/common';
import { RatingController } from './ratings.controller';
import { RatingService } from './ratings.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './model/rating.model';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: Rating.name,
        schema: RatingSchema,
      },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingsModule {}
