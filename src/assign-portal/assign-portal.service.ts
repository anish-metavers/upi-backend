import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AssignPortalDto, UserPortalQueryDto } from './dto/assignPortal.dto';

@Injectable()
export class AssignPortalService {
  async getAllUserPortal(req: Request, query: UserPortalQueryDto) {
    const { user_id } = query;

    let { limit, page } = query;

    limit = Number(limit) || 10;
    page = Number(page) || 1;

    const filterObj = {
      ...(user_id ? { id: user_id } : {}),
    };
    const totalItems = await global.DB.User.count({
      where: filterObj,
      include: {
        model: global.DB.UserPortal,
        as: 'user_portal_data',
        required: true,
      },
    });
    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

    const users = await global.DB.User.findAll({
      where: filterObj,
      attributes: ['id', 'client_id', 'first_name', 'last_name'],
      include: {
        model: global.DB.UserPortal,
        as: 'user_portal_data',
        attributes: ['portal_id'],
        required: true,
        include: {
          model: global.DB.Portal,
          as: 'portal_data',
          attributes: ['id', 'name', 'domain'],
        },
      },
      limit,
      offset,
    });

    return {
      success: true,
      message: 'User Portal Fetched Successfully!!',
      response: { data: users, limit, page, totalItems, totalPages },
    };
  }

  async assignPortal(req: Request, user_id: string, body: AssignPortalDto) {
    const { portal_id } = body;

    const [portal, user] = await Promise.all([
      global.DB.Portal.findOne({ where: { id: portal_id } }),
      global.DB.User.findOne({
        where: { id: user_id },
        attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
        include: {
          model: global.DB.UserRole,
          as: 'user_role_data',
          attributes: ['role_id'],
          required: true,
          include: {
            model: global.DB.Role,
            as: 'role_data',
            attributes: ['id', 'name', 'priority'],
          },
        },
      }),
    ]);

    if (!portal) throw new HttpException({ message: 'Portal not found' }, 404);
    if (!user)
      throw new HttpException(
        { message: 'User not found with this UserId!' },
        404,
      );
    if (user.user_role_data[0].role_data.name != 'Portal Manager')
      throw new HttpException(
        { message: 'User Must be Portal Manager!!' },
        401,
      );

    let userPortal;
    try {
      userPortal = await global.DB.UserPortal.create({
        user_id,
        portal_id,
        created_by: req['user_id'],
      });
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        throw new HttpException(
          { message: 'Portal Already Assigned to this User!!' },
          401,
        );
      else
        throw new HttpException(
          { message: 'Error in Assigning Portal to User!!' },
          404,
        );
    }

    return {
      success: true,
      message: 'Portal Assigned Successfully!!',
      response: { data: userPortal },
    };
  }

  async removePortal(req: Request, user_portal_id: string) {
    const userPortal = await global.DB.UserPortal.findOne({
      where: { id: user_portal_id },
    });

    if (!userPortal)
      throw new HttpException(
        { message: 'User Portal not found with this Id!!' },
        404,
      );

    await userPortal.destroy();

    return {
      success: true,
      message: 'Portal Removed from User Successfully!!',
      response: {},
    };
  }
}
