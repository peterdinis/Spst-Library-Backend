import { Injectable } from '@nestjs/common';
import { ClerkService } from './clerk.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly clerkService: ClerkService,
  ) {}

  async getActiveUsers() {
    return this.clerkService.getActiveUsers();
  }
}
