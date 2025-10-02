import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    type: string;
}