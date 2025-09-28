import { PartialType } from '@nestjs/swagger';
import { CreateBookTagDto } from './create-book-tag.dto';

export class UpdateBookTagDto extends PartialType(CreateBookTagDto) {}
