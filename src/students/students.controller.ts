import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StudentsService } from "./students.service";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";

@ApiTags("students")
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new student account" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "John Doe" },
        username: { type: "string", example: "johndoe123" },
        email: { type: "string", example: "john@example.com" },
        password: { type: "string", example: "securePass123" },
      },
      required: ["name", "username", "email", "password"],
    },
  })
  @ApiResponse({ status: 201, description: "Student account created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  async register(
    @Body() body: { name: string; username: string; email: string; password: string }
  ) {
    return this.studentsService.registerStudent(
      body.name,
      body.username,
      body.email,
      body.password
    );
  }

  @Post("login")
  @ApiOperation({ summary: "Login student and receive JWT token" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        username: { type: "string", example: "johndoe123" },
        password: { type: "string", example: "securePass123" },
      },
      required: ["username", "password"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Successful login returns JWT token",
    schema: {
      example: { access_token: "jwt.token.here" },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() body: { username: string; password: string }) {
    return this.studentsService.login(body.username, body.password);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current student profile (JWT protected)" })
  @ApiResponse({
    status: 200,
    description: "Returns current student's profile",
    schema: {
      example: {
        id: 1,
        name: "John Doe",
        username: "johndoe123",
        email: "john@example.com",
        role: "STUDENT",
        dateJoined: "2025-08-16T12:00:00.000Z",
        isActive: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized - invalid or missing JWT" })
  async profile(@Request() req: any) {
    return this.studentsService.getProfile(req.user.sub);
  }
}
