import { Injectable, Req } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Request } from 'express';

@Injectable()
export class ClientService {
  async createClientUpi(@Req() req: Request, createClientDto: CreateClientDto) {
    const { upi } = createClientDto;
    const client_id = req['client_id'];
    const clientUpi = await global.DB.ClientUpi.create({
      client_id,
      upi,
    });
    return {
      message: 'Created successfully',
      success: true,
      response: {
        newUpi: {
          id: clientUpi.id,
          client_id: clientUpi.client_id,
          upi: clientUpi.upi,
        },
      },
    };
  }

  async updateClientUpiStatus(
    @Req() req: Request,
    id: number,
    updateClientDto: UpdateClientDto,
  ) {
    const client_id = req['client_id'];
    const updateClient = await global.DB.ClientUpi.update(
      {
        ...updateClientDto,
      },
      { where: { id, client_id } },
    );
    return {
      message: 'Updated successfully',
      success: true,
      response: {
        ...updateClientDto,
      },
    };
  }

  async getClientList(@Req() req: Request) {
    const client_id = req['client_id'];
    const list = await global.DB.ClientUpi.findAll(
      {
        attributes: ['id', 'upi', 'status'],
      },
      {
        where: { client_id },
      },
    );
    return {
      message: 'Get all client information',
      success: true,
      response: { list },
    };
  }
}
