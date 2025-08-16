import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new teacher account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        username: { type: 'string', example: 'johndoe123' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'securePass123' },
      },
      required: ['name', 'username', 'email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Teacher account created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(
    @Body()
    body: {
      name: string;
      username: string;
      email: string;
      password: string;
    },
  ) {
    return this.teachersService.registerTeacher(
      body.name,
      body.username,
      body.email,
      body.password,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login teacher and receive JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe123' },
        password: { type: 'string', example: 'securePass123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful login returns JWT token',
    schema: {
      example: { access_token: 'jwt.token.here' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { username: string; password: string }) {
    return this.teachersService.login(body.username, body.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student profile (JWT protected)' })
  @ApiResponse({
    status: 200,
    description: "Returns current student's profile",
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        username: 'johndoe123',
        email: 'john@example.com',
        role: 'STUDENT',
        dateJoined: '2025-08-16T12:00:00.000Z',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT',
  })
  async profile(@Request() req: any) {
    return this.teachersService.getProfile(req.user.sub);
  }
}
