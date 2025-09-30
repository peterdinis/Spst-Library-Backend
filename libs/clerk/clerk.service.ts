import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService {
  private clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  async getActiveUsers() {
    try {
      const sessions = await this.clerk.sessions.getSessionList({
        status: 'active',
      });

      if (!sessions || sessions.data.length === 0) {
        throw new HttpException('No active users found', HttpStatus.NOT_FOUND);
      }

      const userIds = [...new Set(sessions.data.map((s) => s.userId))];

      const users = await Promise.all(
        userIds.map(async (id) => {
          try {
            return await this.clerk.users.getUser(id);
          } catch (err) {
            throw new BadRequestException(
              `Failed to fetch user with ID ${id}: ${err.message || err}`,
            );
          }
        }),
      );
      const validUsers = users.filter((u) => u !== null);

      if (validUsers.length === 0) {
        throw new HttpException(
          'No valid active users found',
          HttpStatus.NOT_FOUND,
        );
      }

      return validUsers;
    } catch (err) {
      throw new HttpException(
        `Failed to fetch active users: ${err.message || err}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
