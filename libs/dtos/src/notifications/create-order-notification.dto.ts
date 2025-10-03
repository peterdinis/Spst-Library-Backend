import { CreateNotificationDto } from '@app/dtos';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderNotificationDto extends OmitType(
  CreateNotificationDto,
  ['userId'] as const,
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userEmail: string;
}
