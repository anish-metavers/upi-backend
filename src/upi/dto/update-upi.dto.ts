import { PartialType } from '@nestjs/mapped-types';
import { CreateUpiDto } from './create-upi.dto';
import { Length, IsNotEmpty } from 'class-validator';

export class UpdateUpiDto extends PartialType(CreateUpiDto) {
  @Length(10, 20)
  @IsNotEmpty()
  userUpiId: string;
}
