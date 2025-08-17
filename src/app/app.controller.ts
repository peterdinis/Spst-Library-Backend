import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from 'src/permissions/decorators/is-public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Returns Hello World message' })
  @ApiResponse({
    status: 200,
    description: 'Hello World message',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
