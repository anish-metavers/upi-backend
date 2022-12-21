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
  async findAll(req: Request, query: ClientListDto) {
    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    let { limit, page } = query;
    const filterObject = {};

    limit = Number(limit) || 10;
    page = Number(page) || 1;

    if (user_role_name !== 'Master Admin')
      return {
        success: true,
        message: 'Client List Fetched Successfully!!',
        response: { data: [], limit, page, totalItems: 0, totalPages: 0 },
      };

    const totalItems = await global.DB.Client.count({
      where: filterObject,
    });
    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

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
    const { upi, portal_id } = createClientDto;
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
    const portal = await global.DB.Portal.findOne({
      where: { id: portal_id, client_id },
    });
    if (!portal) throw new HttpException({ message: 'No Portal Found!!' }, 404);

    let clientUpi = null;
    try {
      clientUpi = await global.DB.ClientUpi.create({
        portal_id,
        client_id,
        upi,
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException({ message: 'Upi Already Exist!!' }, 400);
      else
        throw new HttpException(
          { message: 'Error in creating CLient UPI!!' },
          400,
        );
    }
    return {
      message: 'Created successfully',
      success: true,
      response: {
        newUpi: {
          id: clientUpi.id,
          client_id: clientUpi.client_id,
          portal_id: clientUpi.portal_id,
          upi: clientUpi.upi,
        },
      },
    };
  }

  async updateClientUpiStatus(
    @Req() req: Request,
    client_upi_id: number,
    updateClientDto: UpdateClientUpiDto,
  ) {
    // const client_id = req['client_id'];
    const updateClient = await global.DB.ClientUpi.update(
      {
        ...updateClientDto,
      },
      { where: { id: client_upi_id } },
    );
    return {
      message: 'Updated successfully',
      success: true,
      response: {
        ...updateClientDto,
      },
    };
  }

  async getClientUpiList(@Req() req: Request) {
    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    const filterObject: any = {};

    if (user_role_name === 'Admin') filterObject.client_id = client_id;
    else if (user_role_name === 'Portal Manager') {
      const userPortals = await global.DB.UserPortal.findAll({
        where: { user_id },
        attributes: ['id', 'portal_id'],
      });
      filterObject.portal_id =
        userPortals.length > 0
          ? {
              [Op.in]: userPortals.map((item: any) => item.portal_id),
            }
          : 0;
    }

    console.log(filterObject);

    const list = await global.DB.ClientUpi.findAll({
      where: filterObject,
      attributes: ['id', 'client_id', 'portal_id', 'upi', 'status'],
    });
    return {
      message: 'Get all client information',
      success: true,
      response: { list },
    };
  }
}
