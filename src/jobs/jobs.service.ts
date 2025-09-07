import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  private readonly executedJobs: {
    model: string;
    action: string;
    payload?: unknown;
    ranAt: Date;
  }[] = [];

  logJob(model: string, action: string, payload?: unknown) {
    this.executedJobs.push({
      model,
      action,
      payload,
      ranAt: new Date(),
    });
  }

  getExecutedJobs() {
    return this.executedJobs;
  }
}
