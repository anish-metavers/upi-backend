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
  utr: string;

  client_upi_id: number;

  user_upi: string;

  order_id: number;

  status: string;

  note: string;

  amount_start: number;

  amount_end: number;

  created_at_start: string;

  created_at_end: string;

  updated_at_start: string;

  updated_at_end: string;

  verify_timestamp_start: string;

  verify_timestamp_end: string;

  page_no: number;

  page_size: number;
}
