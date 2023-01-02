import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { PAGINATION } from 'utils/config';
import { AssignUpiDto, AssignUpiListDto } from './dto/assignUpi.dto';

@Injectable()
export class AssignUpiService {
  async assignUpi(
    req: Request,
    user_id: number,
    updateUserUpiDto: AssignUpiDto,
  ) {
    const { upis } = updateUserUpiDto;

    const [find_userUpi, client_upi_permission, user] = await Promise.all([
      global.DB.ClientUpi.findAll({
        where: { id: { [Op.in]: upis } },
      }),
      global.DB.UserUpi.findAll({
        where: { user_id },
        attributes: ['id', 'user_id', 'client_upi_id'],
      }),
      global.DB.User.findOne({
        where: { id: user_id },
        include: [
          {
            model: global.DB.UserRole,
            as: 'user_role_data',
            attributes: ['id', 'user_id', 'role_id'],
            include: [
              {
                model: global.DB.Role,
                as: 'role_data',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      }),
    ]);

    // const find_userUpi = await global.DB.ClientUpi.findAll({
    //   where: { id: { [Op.in]: upis } },
    // });
    // const client_upi_permission = await global.DB.UserUpi.findAll({
    //   where: { user_id },
    //   attributes: ['id', 'user_id', 'client_upi_id'],
    // });

    // const user = await global.DB.User.findOne({
    //   where: { id: user_id },
    //   include: [
    //     {
    //       model: global.DB.UserRole,
    //       as: 'user_role_data',
    //       attributes: ['id', 'user_id', 'role_id'],
    //       include: [
    //         {
    //           model: global.DB.Role,
    //           as: 'role_data',
    //           attributes: ['id', 'name'],
    //         },
    //       ],
    //     },
    //   ],
    // });
    if (!user)
      throw new HttpException(
        { message: 'User Not Found with this User Id!!' },
        401,
      );

    if (!find_userUpi || find_userUpi.length != upis.length) {
      throw new HttpException({ message: 'Client UPI Id is not Valid!!' }, 401);
    }

    let isTrxnManager =
      user.user_role_data.filter(
        (item) => item.role_data.name == 'Transaction Manager',
      ).length > 0;

    if (!isTrxnManager)
      throw new HttpException(
        { message: 'Upi can only be Assigned to Transaction Managers' },
        401,
      );

    let exist_upi = client_upi_permission;
    let upisToAdd = [...upis];
    for (let i = 0; i < exist_upi.length; i++) {
      for (let j = 0; j < upis.length; j++) {
        if (exist_upi[i].client_upi_id == upis[j]) {
          upisToAdd.splice(upisToAdd.indexOf(upis[j]), 1);
        }
      }
    }
    const dataToCreate = [];
    for (let i = 0; i < upisToAdd.length; i++) {
      dataToCreate.push({
        user_id: user_id,
        client_upi_id: upisToAdd[i],
        created_by: req['user_id'],
      });
    }
    const userUpis = await global.DB.UserUpi.bulkCreate(dataToCreate);
    return {
      message: 'Upis added successfully',
      success: true,
    };
  }

  async removeUpi(user_upi_id: number) {
    const upis_delete = await global.DB.UserUpi.destroy({
      where: { id: user_upi_id },
    });
    if (!upis_delete)
      throw new HttpException(
        {
          message: 'No Upi Found to Delete',
        },
        404,
      );
    return {
      message: 'Deleted successfully',
      success: true,
      response: {},
    };
  }

  async findAllUserUpi(req: Request, query: AssignUpiListDto) {
    const filterObject: any = {};
    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const totalItems = (
      await global.DB.UserUpi.findAll({
        where: filterObject,
        attributes: ['id'],
        include: [
          {
            model: global.DB.ClientUpi,
            as: 'client_upi_data',
            attributes: ['id'],
            required: true,
          },
        ],
      })
    ).length;

    const offset = limit * (page - 1);
    const totalPages = Math.ceil(totalItems / limit);

    const userUpi = await global.DB.UserUpi.findAll({
      where: filterObject,
      attributes: ['id', 'user_id', 'client_upi_id', 'status', 'created_at'],
      include: [
        {
          model: global.DB.ClientUpi,
          as: 'client_upi_data',
          attributes: ['id', 'upi', 'client_id', 'portal_id', 'status'],
        },
        {
          model: global.DB.User,
          as: 'user_data',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      limit,
      offset,
    });
    return {
      success: true,
      message: 'User Upis Fetched successfully',
      response: { data: userUpi, limit, page, totalItems, totalPages },
    };
  }
}
