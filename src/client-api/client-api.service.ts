import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CreateClientApiDto } from './dto/create-client-api.dto';
import { UpdateClientApiDto } from './dto/update-client-api.dto';

@Injectable()
export class ClientApiService {
  async create(req: Request, createClientApiDto: CreateClientApiDto) {
    const { api_type, portal_id, api_method, api_endpoint } =
      createClientApiDto;

    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    const portal = await global.DB.Portal.findOne({ where: { id: portal_id } });

    if (!portal) throw new HttpException({ message: 'Portal not found' }, 404);

    if (client_id && portal.client_id != client_id)
      throw new HttpException(
        { message: 'This Portal Does not belongs to You!' },
        404,
      );

    const checkClientApi = await global.DB.ClientApi.findOne({
      where: {
        client_id: portal.client_id,
        portal_id,
        api_type,
      },
    });

    if (checkClientApi)
      throw new HttpException({ message: 'This API already Exists!!' }, 400);

    let clientApi = null;
    try {
      clientApi = await global.DB.ClientApi.create({
        client_id: portal.client_id,
        api_type,
        portal_id,
        api_method,
        api_endpoint,
        created_by: user_id,
      });
    } catch (error) {
      if (error.name == 'SequelizeDatabaseError') {
        throw new HttpException({ message: 'Api Type must be valid!!' }, 400);
      } else {
        throw new HttpException(
          { message: 'Error during creating Client API' },
          400,
        );
      }
    }

    return {
      message: 'Client APIs created successfully',
      success: true,
      response: { data: clientApi },
    };
  }
  async findOne(req: Request, portal_id: number) {
    const portal = await global.DB.Portal.findOne({ where: { id: portal_id } });

    if (!portal) throw new HttpException({ message: 'Portal not found' }, 404);

    const clientApis = await global.DB.ClientApi.findAll({
      where: { portal_id },
    });

    return {
      message: 'Client APIs fetched successfully',
      success: true,
      response: { data: clientApis },
    };
  }

  async update(
    req: Request,
    client_api_id: number,
    updateClientApiDto: UpdateClientApiDto,
  ) {
    const { api_method, api_endpoint, api_type } = updateClientApiDto;
    const clientApi = await global.DB.ClientApi.findOne({
      where: { id: client_api_id },
    });
    if (!clientApi)
      throw new HttpException(
        { message: 'Client API not found with this ID!!' },
        404,
      );
    const checkClientApi = await global.DB.ClientApi.findOne({
      where: {
        client_id: clientApi.client_id,
        portal_id: clientApi.portal_id,
        api_type,
      },
    });

    if (checkClientApi)
      throw new HttpException({ message: 'This API already Exists!!' }, 400);

    await clientApi.update({
      ...(api_method ? { api_method } : {}),
      ...(api_endpoint ? { api_endpoint } : {}),
      ...(api_type ? { api_type } : {}),
    });

    return {
      message: 'Client APIs created successfully',
      success: true,
      response: { data: clientApi },
    };
  }
}
