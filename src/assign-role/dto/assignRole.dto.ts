import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsArray()
  @IsNotEmpty()
  roles: number[];
}
