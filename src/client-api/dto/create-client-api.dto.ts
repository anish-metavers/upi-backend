import { IsNotEmpty } from 'class-validator';

export class CreateClientApiDto {
  // @IsNotEmpty()
  // client_id: number;
  @IsNotEmpty()
  portal_id: number;
  @IsNotEmpty()
  api_type: string;
  @IsNotEmpty()
  api_method: string;
  @IsNotEmpty()
  api_endpoint: string;
}
