import { Injectable } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { OrdersService } from 'src/orders/orders.service';
import { OrderPaginationDto } from 'src/orders/dto/pagination-order.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly clerkService: ClerkService,
    private readonly ordersService: OrdersService
  ) { }

  async getActiveUsers() {
    return this.clerkService.getActiveUsers();
  }

  async allOrders(pagination: OrderPaginationDto) {
    return this.ordersService.getAllCreatedOrders(pagination);
  }
}
