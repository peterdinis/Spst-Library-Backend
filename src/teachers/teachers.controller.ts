import {
  Body,
  Controller,
  Get,
  Patch,
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

  @Get('borrowed-books')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all borrowed books of the current student' })
  @ApiResponse({
    status: 200,
    description: 'List of borrowed books with order info',
    schema: {
      example: [
        {
          orderId: 1,
          status: 'APPROVED',
          borrowedAt: '2025-08-17T12:00:00.000Z',
          book: {
            id: 10,
            title: 'Clean Code',
            authorId: 2,
            categoryId: 5,
            publisherName: 'Prentice Hall',
            isbn: '9780132350884',
            coverImageUrl: 'https://example.com/cleancode.jpg',
            isBorrowed: true,
            publishedYear: 2008,
            language: 'English',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT',
  })
  async borrowedBooks(@Request() req: any) {
    return this.teachersService.getBorrowedBooks(req.user.sub);
  }

  // ========== UPDATE PROFILE ==========
  @Patch('profile-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current student profile (JWT protected)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jane' },
        lastName: { type: 'string', example: 'Smith' },
        classRoom: { type: 'string', example: '2.B' },
        email: { type: 'string', example: 'jane@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Returns updated student's profile",
    schema: {
      example: {
        id: 1,
        name: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        classRoom: '2.B',
        role: 'STUDENT',
        dateJoined: '2025-08-17T12:00:00.000Z',
        isActive: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT',
  })
  async updateProfile(
    @Request() req: any,
    @Body()
    body: {
      name?: string;
      lastName?: string;
      classRoom?: string;
      email?: string;
    },
  ) {
    return this.teachersService.updateProfile(req.user.sub, body);
  }
}
