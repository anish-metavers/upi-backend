import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateClientUpiDto {
  @IsNotEmpty()
  upi: string;

  client_id: string | number;
}

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ClientListDto {
  page: number;

  limit: number;
}
