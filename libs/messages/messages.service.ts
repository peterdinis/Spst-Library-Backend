import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientProxy,
  ) {}

  // RabbitMQ
  async sendRabbitMessage(message: any) {
    await firstValueFrom(this.rabbitClient.send({ cmd: 'process_rabbit' }, message));
  }

  // Kafka
  async sendKafkaMessage(topic: string, message: any) {
    await firstValueFrom(this.kafkaClient.emit(topic, message));
  }

  async connectAll() {
    await this.rabbitClient.connect();
    await this.kafkaClient.connect();
  }
}
