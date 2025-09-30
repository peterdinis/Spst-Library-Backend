import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessagesService {
  constructor(@Inject('KAFKA_SERVICE') private kafkaClient: ClientProxy) {}

  async sendKafkaMessage(topic: string, message: any) {
    await firstValueFrom(this.kafkaClient.emit(topic, message));
  }

  async connectAll() {
    await this.kafkaClient.connect();
  }
}
