import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto, CreateClientUpiDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class UpdateClientUpiDto {
  upi: string;
  status: string;
}
