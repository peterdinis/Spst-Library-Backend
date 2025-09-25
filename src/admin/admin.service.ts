import { Injectable } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { OrdersService } from 'src/orders/orders.service';
import { OrderPaginationDto } from 'src/orders/dto/pagination-order.dto';
import { AuthorSuggestionService } from 'src/authors-suggestion/authors-suggestion.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly clerkService: ClerkService,
    private readonly ordersService: OrdersService,
    private readonly authorSuggestionService: AuthorSuggestionService,
  ) {}

  async getActiveUsers() {
    return this.clerkService.getActiveUsers();
  }

  async allOrders(pagination: OrderPaginationDto) {
    return this.ordersService.getAllCreatedOrders(pagination);
  }

  async adminApproveSuggestion(suggestionId: number) {
    return this.authorSuggestionService.approveSuggestion(suggestionId);
  }

  async adminRejectSuggestion(suggestionId: number) {
    return this.authorSuggestionService.rejectSuggestion(suggestionId);
  }
}
