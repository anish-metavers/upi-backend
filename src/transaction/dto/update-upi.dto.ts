import { PartialType } from '@nestjs/mapped-types';
import { CreateUpiDto } from './create-upi.dto';
import { Length, IsNotEmpty, Matches } from 'class-validator';

export class UpdateUpiDto extends PartialType(CreateUpiDto) {
  @Matches(/^[A-Za-z0-9]{2,20}@{1}[a-zA-Z]{2,}/, {
    message: 'Not a Valid UPI! ~',
  })
  @IsNotEmpty()
  user_upi: string;
}
export class UpdateStatusDto {
  @IsNotEmpty()
  status: string;
}

export class VerifyUtrDto {
  @Length(6, 12)
  @IsNotEmpty()
  utr: string;
}

export class InitTransactionDTO {
  @IsNotEmpty()
  portal_id: string | number;
}
