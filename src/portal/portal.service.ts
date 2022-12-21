import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PAGINATION } from 'utils/config';
import { CreatePortalDto, PortalFindDto } from './dto/create-portal.dto';
import { UpdatePortalDto } from './dto/update-portal.dto';

@Injectable()
export class PortalService {
  async create(req: Request, createPortalDto: CreatePortalDto) {
    const { name, domain, redirect_url } = createPortalDto;
    const client_id = req['client_id'] || createPortalDto.client_id;
    if (!client_id)
      throw new HttpException(
        { message: 'Client Id is required for Master Admin!!' },
        401,
      );
    let portal;
    try {
      portal = await global.DB.Portal.create({
        name,
        domain,
        client_id,
        redirect_url,
        created_by: req['user_id'],
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException({ message: 'Domain Already in Use!!' }, 401);
      else
        throw new HttpException({ message: 'Error in Creating Portal!!' }, 500);
    }

    return {
      success: true,
      message: 'Portal created successfully',
      response: { data: portal },
    };
  }

  async findAll(req: Request, query: PortalFindDto) {
    const filterObject: any = {};

    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    if (user_role_name != 'Master Admin') filterObject.client_id = client_id;

    const totalItems = await global.DB.Portal.count({
      where: filterObject,
    });
    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

    const portals = await global.DB.Portal.findAll({
      where: filterObject,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
        {
          model: global.DB.User,
          as: 'created_by_data',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      limit,
      offset,
    });

    return {
      success: true,
      message: 'Portal Fetched successfully',
      response: { data: portals, limit, page, totalItems, totalPages },
    };
  }

  async findOne(req: Request, portal_id: number, query: PortalFindDto) {
    const client_id = req['client_id'] || query.client_id;

    // if (!client_id)
    //   throw new HttpException(
    //     { message: 'Client Id is required for Master Admin!!' },
    //     401,
    //   );

    const portal = await global.DB.Portal.findOne({
      where: {
        ...(client_id ? { client_id } : {}),
        id: portal_id,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
        {
          model: global.DB.User,
          as: 'created_by_data',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!portal)
      throw new HttpException(
        {
          message: 'No Portal Found OR You do not have access to this Portal!!',
        },
        401,
      );

    return {
      success: true,
      message: 'Portal fetched successfully',
      response: { data: portal },
    };
  }

  async update(
    req: Request,
    portal_id: number,
    updatePortalDto: UpdatePortalDto,
  ) {
    const { name, domain, redirect_url, status } = updatePortalDto;
    const client_id = req['client_id'] || updatePortalDto.client_id;

    const portal = await global.DB.Portal.findOne({
      where: {
        ...(client_id ? { client_id } : {}),
        id: portal_id,
      },
    });

    if (!portal)
      throw new HttpException(
        {
          message: 'No Portal Found OR You do not have access to this Portal!!',
        },
        401,
      );

    try {
      await portal.update({
        ...(name ? { name } : {}),
        ...(domain ? { domain } : {}),
        ...(redirect_url ? { redirect_url } : {}),
        ...(status ? { status } : {}),
        updated_by: req['user_id'],
      });
    } catch (error) {
      console.log(error);
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException({ message: 'Domain Already in Use!!' }, 401);
      else throw new HttpException({ message: 'Error in  Portal!!' }, 500);
    }

    return {
      success: true,
      message: 'Portal updated successfully',
      response: { data: portal },
    };
  }
}
