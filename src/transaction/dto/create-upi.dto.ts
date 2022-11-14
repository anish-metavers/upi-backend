import { Length, Max, Min, IsNotEmpty } from 'class-validator';

export class CreateUpiDto {
  @Min(300.0)
  @Max(100000.0)
  @IsNotEmpty()
  amount: number;

  @Length(10, 20)
  @IsNotEmpty()
  client_upi: string;

  @Length(5, 10)
  @IsNotEmpty()
  order_id: number;
}

