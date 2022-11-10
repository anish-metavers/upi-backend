import { IsNotEmpty, IsEmail, Length } from 'class-validator';
export class CreateAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Length(8, 16)
  @IsNotEmpty()
  password: string;
}
