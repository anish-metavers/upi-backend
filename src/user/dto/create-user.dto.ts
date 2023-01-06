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
  client_id: string | number;
  role_id: string | number;
  role_name: string;
  email: string;
  first_name: string;
  status: string;
  page: number;
  limit: number;
}
