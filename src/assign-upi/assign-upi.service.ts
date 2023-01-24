import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { PAGINATION } from 'utils/config';
import { Misc } from 'utils/misc';
import { AssignUpiDto, AssignUpiListDto } from './dto/assignUpi.dto';

@Injectable()
export class AssignUpiService {
  async assignUpi(
    req: Request,
    user_id: number,
    updateUserUpiDto: AssignUpiDto,
  ) {
    const { upis } = updateUserUpiDto;

    const [clientUpis, userUpis, user] = await Promise.all([
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

    if (!user)
      throw new HttpException(
        { message: 'User Not Found with this User Id!!' },
        401,
      );

    if (!clientUpis || clientUpis.length != upis.length) {
      throw new HttpException({ message: 'Client UPI Id is not Valid!!' }, 401);
    }

    // Check if User is Transaction Manager
    const isUserTrxnManager =
      user.user_role_data.filter(
        (item: any) => item.role_data.name == 'Transaction Manager',
      ).length > 0;
    if (!isUserTrxnManager)
      throw new HttpException(
        { message: 'Upi can only be Assigned to Transaction Managers' },
        401,
      );

    clientUpis.map((item: any) => {
      if (item.client_id != user.client_id) {
        throw new HttpException(
          { message: 'User and Upi does not belongs to same Client!' },
          401,
        );
      }
    });

    // Filter Already Existing Upis
    const exist_upi = userUpis;
    const upisToAdd = [...upis];
    for (let i = 0; i < exist_upi.length; i++) {
      for (let j = 0; j < upis.length; j++) {
        if (exist_upi[i].client_upi_id == upis[j]) {
          upisToAdd.splice(upisToAdd.indexOf(upis[j]), 1);
        }
      }
    }

    // Generating Final Array to Create Entry in DB
    const dataToCreate = [];
    for (let i = 0; i < upisToAdd.length; i++) {
      dataToCreate.push({
        user_id: user_id,
        client_upi_id: upisToAdd[i],
        created_by: req['user_id'],
      });
    }
    await global.DB.UserUpi.bulkCreate(dataToCreate);
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
    const { client_id, portal_id, client_upi_id, first_name } = query;
    const filterObject: any = {};
    let clientUpiFilterObj: any = {};
    const innerFilterObject2: any = {};

    const req_client_id = req['client_id'];
    const req_user_id = req['user_id'];
    const user_role_name = req['role_name'];

    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    if (client_upi_id) filterObject.client_upi_id = client_upi_id;
    if (first_name)
      innerFilterObject2.first_name = { [Op.like]: `%${first_name}%` };

    const filterFromRole = await Misc.createFilterFromRoles(
      user_role_name,
      req_client_id,
      req_user_id,
      {
        client_id,
        portal_id,
      },
    );

    clientUpiFilterObj = { ...clientUpiFilterObj, ...filterFromRole };

    const totalItems = (
      await global.DB.UserUpi.findAll({
        where: filterObject,
        attributes: ['id'],
        include: [
          {
            model: global.DB.ClientUpi,
            as: 'client_upi_data',
            where: clientUpiFilterObj,
            attributes: ['id'],
            required: true,
          },
          {
            model: global.DB.User,
            as: 'user_data',
            required: true,
            where: innerFilterObject2,
            attributes: ['id'],
          },
        ],
      })
    ).length;

    const offset = limit * (page - 1);
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const userUpi = await global.DB.UserUpi.findAll({
      where: filterObject,
      attributes: ['id', 'user_id', 'client_upi_id', 'status', 'created_at'],
      include: [
        {
          model: global.DB.ClientUpi,
          as: 'client_upi_data',
          where: clientUpiFilterObj,
          required: true,
          attributes: ['id', 'upi', 'client_id', 'portal_id', 'status'],
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
        },
        {
          model: global.DB.User,
          as: 'user_data',
          required: true,
          where: innerFilterObject2,
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
      ...(limit ? { limit } : {}),
      offset,
    });
    return {
      success: true,
      message: 'User Upis Fetched successfully',
      response: { data: userUpi, limit, page, totalItems, totalPages },
    };
  }
}
