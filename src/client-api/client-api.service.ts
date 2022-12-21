import { Injectable } from '@nestjs/common';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { UpdateClientApiDto } from './dto/update-client-api.dto';

@Injectable()
export class ClientApiService {
  create(createClientApiDto: CreateClientApiDto) {
    return 'This action adds a new clientApi';
  }

  findAll() {
    return `This action returns all clientApi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientApi`;
  }

  update(id: number, updateClientApiDto: UpdateClientApiDto) {
    return `This action updates a #${id} clientApi`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientApi`;
  }
}
