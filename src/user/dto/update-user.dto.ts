import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
  @IsArray()
  @IsNotEmpty()
  roles: number[];
}

export class UpdateUserUpiDto {
  @IsArray()
  @IsNotEmpty()
  upis: number[];
}
