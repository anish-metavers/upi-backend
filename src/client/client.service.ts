import { HttpException, Injectable, Req } from '@nestjs/common';
import {
  ClientListDto,
  CreateClientDto,
  CreateClientUpiDto,
} from './dto/create-client.dto';
import { UpdateClientDto, UpdateClientUpiDto } from './dto/update-client.dto';
import { Request } from 'express';
import { Op } from 'sequelize';

@Injectable()
export class ClientService {
  async findAll(query: ClientListDto) {
    let { limit, page } = query;
    const filterObject = {};

    limit = Number(limit) || 10;
    page = Number(page) || 1;

    const totalItems = await global.DB.Client.count({
      where: filterObject,
    });
    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

    console.log('Page: ', page);
    console.log('limit: ', limit);
    console.log('totalItems: ', totalItems);
    console.log('offset: ', offset);
    console.log('totalPages: ', totalPages);

    const clients = await global.DB.Client.findAll({
      where: filterObject,
      attributes: ['id', 'name', 'email', 'status'],
      limit,
      offset,
    });

    return {
      success: true,
      message: 'Client List Fetched Successfully!!',
      response: { data: clients, limit, page, totalItems, totalPages },
    };
  }

  async createClient(createClientDto: CreateClientDto) {
    const { name, email } = createClientDto;

    const checkClient = await global.DB.Client.findOne({
      where: {
        email,
      },
    });
    if (checkClient)
      throw new HttpException({ message: 'Client Already Exist!!' }, 400);

    const client = await global.DB.Client.create({
      name,
      email: email.toLowerCase(),
    });

    return {
      success: true,
      response: {
        data: {
          id: client.id,
          name: client.name,
          email: client.email,
        },
      },
      message: 'Client Created Successfully!!',
    };
  }

  async updateClient(client_id: number, updateClientDto: UpdateClientDto) {
    const { name, email } = updateClientDto;
    const client = await global.DB.Client.findOne({
      where: { id: client_id },
    });
    if (!client) throw new HttpException({ message: 'No Client Found!!' }, 400);

    const createObj = {};
    if (email) {
      const client = await global.DB.Client.findOne({
        where: { id: { [Op.ne]: client_id }, email },
      });
      if (client)
        throw new HttpException(
          { message: 'Client Already Exist with this Email!!' },
          400,
        );
    }

    await client.update({ ...updateClientDto });
    return { success: true, message: 'Client Updated Successfully!!' };
  }

  async createClientUpi(
    @Req() req: Request,
    createClientDto: CreateClientUpiDto,
  ) {
    const { upi } = createClientDto;
    let client_id = req['client_id'];

    if (!client_id) {
      client_id = createClientDto.client_id;
      if (!client_id)
        throw new HttpException(
          { message: 'client_id is Required: For Master Admin!!' },
          400,
        );

      const checkClient = await global.DB.Client.findOne({
        where: { id: createClientDto.client_id },
      });
      if (!checkClient)
        throw new HttpException(
          { message: 'Invalid ClientId Selected!!' },
          400,
        );
    }
    let clientUpi;
    try {
      clientUpi = await global.DB.ClientUpi.create({
        client_id,
        upi,
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException({ message: 'Upi Already Exist!!' }, 400);
    }
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
    updateClientDto: UpdateClientUpiDto,
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
