import { IsNotEmpty } from 'class-validator';

export class CreatePortalDto {
  client_id: string | number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  domain: string;

  @IsNotEmpty()
  redirect_url: string;
}

export class PortalFindDto {
  client_id: string | number;
}
