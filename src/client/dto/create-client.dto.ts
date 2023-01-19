import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateClientUpiDto {
  @IsNotEmpty()
  name: string;

  @Matches(/^[A-Za-z0-9]{2,20}@{1}[a-zA-Z]{2,}/, {
    message: 'Not a Valid UPI! ~',
  })
  @IsNotEmpty()
  upi: string;

  client_id: string | number;

  @IsNotEmpty()
  portal_id: string | number;
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

export class ClientUpiListDto {
  client_id: string | number;
  portal_id: string | number;
  status: string;

  page: number;

  limit: number;
}
