import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignUpiDto {
  @IsArray()
  @IsNotEmpty()
  upis: number[];
}

export class AssignUpiListDto {
  limit: number;
  page: number;
}
