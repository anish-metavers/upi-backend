import { PartialType } from '@nestjs/mapped-types';
import { CreateUpiDto } from './create-upi.dto';
import { Length, IsNotEmpty } from 'class-validator';

export class UpdateUpiDto extends PartialType(CreateUpiDto) {
  @Length(10, 40)
  @IsNotEmpty()
  user_upi: string;
}

export class VerifyUtrDto {
  @Length(6, 12)
  @IsNotEmpty()
  utr: string;
}