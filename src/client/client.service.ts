import { HttpException, Injectable, Req } from '@nestjs/common';
import {
  ClientListDto,
  ClientUpiListDto,
  CreateClientDto,
  CreateClientUpiDto,
} from './dto/create-client.dto';
import { UpdateClientDto, UpdateClientUpiDto } from './dto/update-client.dto';
import { Request } from 'express';
import { Op } from 'sequelize';
import { PAGINATION } from 'utils/config';
import { Misc } from 'utils/misc';

@Injectable()
export class ClientService {
  async findAll(req: Request, query: ClientListDto) {
    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    let { limit, page } = query;
    const filterObject = {};

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

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

  async createClient(createClientDto: CreateClientDto, req: Request) {
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
      created_by: req['user_id'],
    });

    return {
      success: true,
      message: 'Client Created Successfully!!',
      response: {
        data: {
          id: client.id,
          name: client.name,
          email: client.email,
        },
      },
    };
  }

  async updateClient(
    req: Request,
    client_id: number,
    updateClientDto: UpdateClientDto,
  ) {
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

    await client.update({
      ...updateClientDto,
      updated_by: req['user_id'],
    });
    return { success: true, message: 'Client Updated Successfully!!' };
  }

  async createClientUpi(
    @Req() req: Request,
    createClientDto: CreateClientUpiDto,
  ) {
    const { name, upi, portal_id } = createClientDto;
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
        name,
        upi,
        created_by: req['user_id'],
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

    const newUpi = await global.DB.ClientUpi.findOne({
      where: { id: clientUpi.id },
      include: [
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
        {
          model: global.DB.Portal,
          as: 'portal_data',
          attributes: ['id', 'name'],
        },
      ],
    });
    return {
      message: 'Client UPI Created Successfully!!',
      success: true,
      response: {
        data: newUpi,
      },
    };
  }

  async updateClientUpiStatus(
    @Req() req: Request,
    client_upi_id: number,
    updateClientDto: UpdateClientUpiDto,
  ) {
    // const client_id = req['client_id'];
    const { name, upi, status } = updateClientDto;
    const client_upi = await global.DB.ClientUpi.findOne({
      where: { id: client_upi_id },
    });
    if (!client_upi)
      throw new HttpException({ message: 'Client Upi Not Found' }, 404);

    const clientUpis = await global.DB.ClientUpi.findAll({
      where: {
        id: { [Op.ne]: client_upi.id },
        client_id: client_upi.client_id,
        portal_id: client_upi.portal_id,
      },
    });

    const everyUpiIsInactive = clientUpis.every(
      (item) => item.status === 'INACTIVE',
    );

    if (everyUpiIsInactive && status === 'INACTIVE')
      throw new HttpException(
        { message: 'Can not set all Upis of a Portal to Inactive' },
        400,
      );

    try {
      await client_upi.update({
        ...(name ? { name } : {}),
        ...(upi ? { upi } : {}),
        ...(status ? { status } : {}),
        updated_by: req['user_id'],
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException({ message: 'Upi Already Exist!!' }, 400);
      else {
        console.log(error);
        throw new HttpException(
          { message: 'Error in Updating CLient UPI!!' },
          400,
        );
      }
    }

    await client_upi.reload();

    return {
      message: 'Client UPI Updated successfully',
      success: true,
      response: {
        data: client_upi,
      },
    };
  }

  async getClientUpiList(@Req() req: Request, query: ClientUpiListDto) {
    const { client_id, portal_id, status } = query;
    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const req_client_id = req['client_id'];
    const req_user_id = req['user_id'];
    const user_role_name = req['role_name'];

    let filterObject: any = {};

    if (portal_id) filterObject.portal_id = portal_id;
    if (status) filterObject.status = status;

    const filterFromRoles = await Misc.createFilterFromRoles(
      user_role_name,
      req_client_id,
      req_user_id,
      {
        client_id,
        portal_id,
      },
    );

    console.log('FilterFromRoles:', filterFromRoles);

    filterObject = { ...filterObject, ...filterFromRoles };

    const totalItems = await global.DB.ClientUpi.count({
      where: filterObject,
    });
    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

    const list = await global.DB.ClientUpi.findAll({
      where: filterObject,
      attributes: ['id', 'client_id', 'portal_id', 'name', 'upi', 'status'],
      include: [
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
        {
          model: global.DB.Portal,
          as: 'portal_data',
          attributes: ['id', 'name'],
        },
      ],
      limit,
      offset,
    });
    return {
      message: 'Client UPIs Fetched Successfully!',
      success: true,
      response: { list, limit, page, totalItems, totalPages },
    };
  }
}
