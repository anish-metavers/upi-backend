import { Injectable } from '@nestjs/common';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { UpdateClientApiDto } from './dto/update-client-api.dto';

@Injectable()
export class ClientApiService {
  async create(createClientApiDto: CreateClientApiDto) {
    const { client_id, api_type, portal_id, api_method, api_endpoint } =
      createClientApiDto;
    const result = await global.DB.clientApi.create({
      client_id,
      api_type,
      portal_id,
      api_method,
      api_endpoint,
    });
    return {
      message: 'Client APIs created successfully',
      success: true,
      clientId: result.client_id,
      apiType: result.api_type,
      portalId: result.portal_id,
      apiMethod: result.api_method,
      apiEndPoint: result.api_endpoint,
    };
  }
  findOne(id: number) {
    return `This action returns a #${id} clientApi`;
  }

  update(id: number, updateClientApiDto: UpdateClientApiDto) {
    return `This action updates a #${id} clientApi`;
  }
}
