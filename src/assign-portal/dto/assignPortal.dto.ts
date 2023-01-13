import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignPortalDto {
  @IsArray()
  @IsNotEmpty()
  portal_ids: number[];
}

export class UserPortalQueryDto {
  user_id: string | number;
  limit: number;
  page: number;
}
