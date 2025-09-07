import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Get executed jobs history' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of executed jobs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          model: { type: 'string', example: 'Book' },
          action: { type: 'string', example: 'create' },
          payload: { type: 'object', example: { id: 1, name: 'Harry Potter' } },
          ranAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  getJobs() {
    return this.jobsService.getExecutedJobs();
  }
}
