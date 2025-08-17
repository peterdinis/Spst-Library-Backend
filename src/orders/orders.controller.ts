import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  AdminGuard,
  StudentGuard,
  TeacherGuard,
} from 'src/permissions/guards/roles.guard';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(StudentGuard, TeacherGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(
      createOrderDto.accountId,
      createOrderDto.bookId,
    );
  }

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Retrieve all orders with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of orders returned successfully',
  })
  findAll(@Query() query: FindAllOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an order by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the order' })
  @ApiResponse({ status: 200, description: 'Order returned successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the order' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(+id, updateOrderDto.status);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
