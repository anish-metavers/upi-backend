import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignUpiDto {
  @IsArray()
  @IsNotEmpty()
  upis: number[];
}

export class AssignUpiListDto {
  client_id: string | number;
  portal_id: string | number;
  client_upi_id: string | number;
  first_name: string;
  limit: number;
  page: number;
}
