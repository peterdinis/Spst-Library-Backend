import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class AdvancedValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Pretransformuje plain object na inštanciu triedy
    const object = plainToInstance(metatype, value);

    // Validuje objekt
    const errors = await validate(object, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      const messages = errors.map(err => {
        const constraints = err.constraints ? Object.values(err.constraints).join(', ') : '';
        return `${err.property} - ${constraints}`;
      });
      throw new BadRequestException(`Validation failed: ${messages.join('; ')}`);
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
