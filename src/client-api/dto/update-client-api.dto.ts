import { PartialType } from '@nestjs/mapped-types';
import { CreateClientApiDto } from './create-client-api.dto';

export class UpdateClientApiDto extends PartialType(CreateClientApiDto) {}
