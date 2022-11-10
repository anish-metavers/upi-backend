import { Length, Max, Min, IsNotEmpty } from 'class-validator';

export class CreateUpiDto {
  @Min(300.0)
  @Max(100000.0)
  @IsNotEmpty()
  amount: number;

  @Length(10, 20)
  @IsNotEmpty()
  businessUpiId: string;

  @Length(5, 10)
  @IsNotEmpty()
  orderNumber: number;
}

export class VerifyUtrDto extends CreateUpiDto {
  @IsNotEmpty()
  @Length(10, 20)
  utrNumber: string;
}
