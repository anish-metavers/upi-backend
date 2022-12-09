import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  client_id: string | number;

  @IsNotEmpty()
  firstName: string;

  lastName: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsNotEmpty()
  roles: number[];
}

export class UserListDto {
  page: number;
  limit: number;
}
