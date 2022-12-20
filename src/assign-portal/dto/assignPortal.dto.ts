import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignPortalDto {
  @IsNotEmpty()
  portal_id: string | number;
}

export class UserPortalQueryDto {
  user_id: string | number;
  limit: number;
  page: number;
}
