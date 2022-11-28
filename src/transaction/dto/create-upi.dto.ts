import { Length, Max, Min, IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateUpiDto {
  @Min(300.0)
  @Max(100000.0)
  @IsNotEmpty()
  amount: number;

  @Length(6, 40)
  @IsNotEmpty()
  client_upi: string;

  @Length(4, 8)
  @IsNotEmpty()
  order_id: number;
}
export class TransactionListFilterDto {
  //@IsString()
  utr: string;

  //@IsInt()
  client_upi_id: number;

  //@IsString()
  user_upi: string;

  //@IsInt()
  order_id: number;

  //@IsInt()
  amount: number;

  //@IsString()
  status: string;

  //@IsString()
  verify_timestamp: string;

  //@IsString()
  note: string;
}
