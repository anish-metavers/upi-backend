import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { PAGINATION } from 'utils/config';
import { AssignPortalDto, UserPortalQueryDto } from './dto/assignPortal.dto';

@Injectable()
export class AssignPortalService {
  async getAllUserPortal(req: Request, query: UserPortalQueryDto) {
    const { user_id } = query;

    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const filterObj = {
      ...(user_id ? { user_id } : {}),
    };
    const totalItems = (
      await global.DB.UserPortal.findAll({
        where: filterObj,
        attributes: ['id'],
        include: [
          {
            model: global.DB.Portal,
            as: 'portal_data',
            attributes: ['id'],
            required: true,
          },
        ],
      })
    ).length;
    const offset = limit * (page - 1);
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const users = await global.DB.UserPortal.findAll({
      where: filterObj,
      attributes: ['id', 'user_id', 'portal_id', 'status', 'created_at'],
      include: [
        {
          model: global.DB.Portal,
          as: 'portal_data',
          attributes: ['id', 'name', 'status'],
        },
        {
          model: global.DB.User,
          as: 'user_data',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      ...(limit ? { limit } : {}),
      offset,
    });

    return {
      success: true,
      message: 'User Portal Fetched Successfully!!',
      response: { data: users, limit, page, totalItems, totalPages },
    };
  }

  async assignPortal(req: Request, user_id: string, body: AssignPortalDto) {
    const { portal_ids } = body;

    const [portals, user] = await Promise.all([
      global.DB.Portal.findAll({
        where: { id: { [Op.in]: portal_ids } },
      }),
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

    if (!portals || portals.length != portal_ids.length)
      throw new HttpException({ message: 'Invalid Portals found!!' }, 404);

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

    let userPortal = null;
    let trxn = await global.DB.sequelize.transaction();

    let dataArr = portal_ids.map((id) => {
      return { user_id, portal_id: id, created_by: req['user_id'] };
    });
    try {
      userPortal = await global.DB.UserPortal.bulkCreate(dataArr, {
        transaction: trxn,
      });
    } catch (error) {
      await trxn.rollback();
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

    await trxn.commit();

    // await userPortal.reload();
    return {
      success: true,
      message: 'Portal Assigned Successfully!!',
      response: {},
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
