import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateClientUpiDto {
  @IsNotEmpty()
  upi: string;
}

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
