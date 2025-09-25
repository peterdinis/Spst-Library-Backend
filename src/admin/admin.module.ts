import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ClerkService } from './clerk.service';
import { OrdersModule } from 'src/orders/orders.module';
import { AuthorsSuggestionModule } from 'src/authors-suggestion/authors-suggestion.module';

@Module({
  imports: [OrdersModule, AuthorsSuggestionModule],
  providers: [AdminService, ClerkService],
  controllers: [AdminController],
})
export class AdminModule {}
