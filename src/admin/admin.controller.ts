import { Controller, Get, Query, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { OrderPaginationDto } from 'src/orders/dto/pagination-order.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('active-users')
  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({ status: 200, description: 'List of active users returned successfully.' })
  getActiveUsers() {
    return this.adminService.getActiveUsers();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING','COMPLETED','CANCELLED','RETURNED','NOT_RETURNED','CANCELLATION_REQUESTED'] })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  allOrders(@Query() pagination: OrderPaginationDto) {
    return this.adminService.allOrders(pagination);
  }

  @Patch('author-suggestion/:id/approve')
  @ApiOperation({ summary: 'Approve an author suggestion and create a new author' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the author suggestion to approve' })
  @ApiResponse({ status: 200, description: 'Author suggestion approved and new author created'})
  adminApproveSuggestion(@Param('id') id: number) {
    return this.adminService.adminApproveSuggestion(id);
  }

  @Patch('author-suggestion/:id/reject')
  @ApiOperation({ summary: 'Reject an author suggestion' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the author suggestion to reject' })
  @ApiResponse({ status: 200, description: 'Author suggestion rejected' })
  adminRejectSuggestion(@Param('id') id: number) {
    return this.adminService.adminRejectSuggestion(id);
  }
}
