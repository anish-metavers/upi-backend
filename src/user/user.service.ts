import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserListDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserUpiDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import Role from 'model/role';
import { Request } from 'express';
import { User } from 'model/user';
import { PAGINATION } from 'utils/config';
@Injectable()
export class UserService {
  async create(req: Request, createUserDto: CreateUserDto) {
    const { client_id, firstName, lastName, email, password, roles } =
      createUserDto;

    const req_user_id = req['user_id'];
    const req_role_name = req['role_name'];

    let CLIENT_ID: string | number;

    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    const [checkUser, checkRoles, reqUserRoles] = await Promise.all([
      global.DB.User.findOne({ where: { email } }),
      global.DB.Role.findAll({
        where: { id: { [Op.in]: roles } },
      }),
      global.DB.UserRole.findAll({
        where: { user_id: req_user_id },
        include: {
          model: global.DB.Role,
          as: 'role_data',
          attributes: ['id', 'name', 'priority'],
        },
      }),
    ]);

    if (checkUser)
      throw new HttpException({ message: 'User already exists' }, 400);
    if (checkRoles.length !== roles.length)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    if (
      req_role_name === 'Master Admin' &&
      checkRoles[0].name == 'Master Admin'
    ) {
      CLIENT_ID = null;
    } else if (req_role_name === 'Master Admin' && !client_id) {
      throw new HttpException({ message: 'Please provide a Client Id!!' }, 404);
    } else if (req_role_name === 'Master Admin' && client_id) {
      const client = await global.DB.Client.findOne({
        where: { id: client_id },
        attributes: ['id'],
      });
      if (!client)
        throw new HttpException({ message: 'Client not found' }, 404);
      CLIENT_ID = client_id;
    } else {
      CLIENT_ID = req['client_id'];
    }

    let maxGuardUserRole = reqUserRoles[0];
    for (let guard_role of reqUserRoles) {
      if (guard_role.role_data.priority > maxGuardUserRole.role_data.priority)
        maxGuardUserRole = guard_role;
    }

    for (let role of checkRoles) {
      if (maxGuardUserRole.role_data.priority < role.priority)
        throw new HttpException(
          { message: 'You can not create user above your Role!!' },
          400,
        );
    }

    const hashedPassword = password; //await bcrypt.hash(password, 10);

    const trxn = await global.DB.sequelize.transaction();
    const user = await global.DB.User.create(
      {
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        client_id: CLIENT_ID,
        created_by: req['user_id'],
      },
      { transaction: trxn },
    );

    let rolesCreated = null;
    try {
      // Create Roles
      const rolesData = roles.map((item) => {
        return { user_id: user.id, role_id: item, created_by: req['user_id'] };
      });
      rolesCreated = await global.DB.UserRole.bulkCreate(rolesData, {
        transaction: trxn,
      });
    } catch (error) {
      console.log(error);
      await trxn.rollback();
      throw new HttpException(
        { message: 'Internal Server Error!! In Creating Role!' },
        400,
      );
    }
    await trxn.commit();
    await user.reload();
    return {
      success: true,
      message: 'User Created Successfully',
      response: {
        data: user,
      },
    };
  }

  async findAll(req: Request, query: UserListDto) {
    const { client_id, email, first_name, status, role_id, role_name } = query;

    let { limit, page } = query;

    limit = Number(limit) || PAGINATION.LIMIT;
    page = Number(page) || PAGINATION.PAGE;

    const req_client_id = req['client_id'];
    const user_id = req['user_id'];
    const user_role_name = req['role_name'];

    const filterObject: any = {};
    const roleFilterObj: any = { ...(role_id ? { role_id } : {}) };

    if (client_id) filterObject.client_id = client_id;
    if (email) filterObject.email = { [Op.like]: `%${email}%` };
    if (first_name) filterObject.first_name = { [Op.like]: `%${first_name}%` };
    if (status) filterObject.status = status;

    if (user_role_name === 'Admin') filterObject.client_id = req_client_id;
    else if (user_role_name === 'Portal Manager') {
      filterObject.client_id = req_client_id;
    }

    let checkRole: any;
    if (!role_id && role_name) {
      checkRole = await global.DB.Role.findOne({
        where: { name: role_name },
      });
      if (!checkRole) {
        throw new HttpException({ message: 'Role Name Does not Match!!' }, 404);
      }
      roleFilterObj.role_id = checkRole.id;
    }

    const totalItems = (
      await global.DB.User.findAll({
        where: filterObject,
        attributes: ['id'],
        include: {
          model: global.DB.UserRole,
          as: 'user_role_data',
          where: roleFilterObj,
          attributes: ['id'],
          required: true,
        },
      })
    ).length;

    const offset = limit * (page - 1);
    const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

    const users = await global.DB.User.findAll({
      where: filterObject,
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
      include: [
        {
          model: global.DB.UserRole,
          as: 'user_role_data',
          attributes: ['role_id'],
          where: roleFilterObj,
          required: true,
          include: {
            model: global.DB.Role,
            as: 'role_data',
            attributes: ['id', 'name', 'priority'],
          },
        },
        {
          model: global.DB.Client,
          as: 'client_data',
          attributes: ['id', 'name'],
        },
      ],
      // logging: true,
      ...(limit ? { limit } : {}),
      offset,
    });

    return {
      success: true,
      message: 'User List Fetched Successfully',
      response: {
        data: users,
        limit,
        page,
        totalItems,
        totalPages,
      },
    };
  }

  async findOne(req: Request, id: number) {
    const user = await global.DB.User.findOne({
      where: { id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
    });

    if (!user)
      throw new HttpException({ message: 'No User found with this Id!!' }, 401);

    const userRoles = await global.DB.UserRole.findAll({
      where: { user_id: user.id },
      include: {
        model: global.DB.Role,
        as: 'role_data',
        attributes: ['id', 'name', 'priority'],
      },
    });

    let tempRoles = [];
    userRoles.map((item: any) => {
      tempRoles.push({ ...item.toJSON().role_data });
    });
    const userData = user.toJSON();
    userData.roles = tempRoles;

    return {
      success: true,
      message: 'User Fetched Successfully',
      response: { data: userData },
    };
  }

  async findSelfUser(req: Request) {
    const user_id = req['user_id'];
    const user = await global.DB.User.findOne({
      where: { id: user_id },
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
    });

    if (!user)
      throw new HttpException({ message: 'No User found with this Id!!' }, 401);

    const userRoles = await global.DB.UserRole.findAll({
      where: { user_id: user.id },
      include: {
        model: global.DB.Role,
        as: 'role_data',
        attributes: ['id', 'name', 'priority'],
      },
    });

    let tempRoles = [];
    userRoles.map((item: any) => {
      tempRoles.push({ ...item.toJSON().role_data });
    });
    const userData = user.toJSON();
    userData.roles = tempRoles;

    return {
      success: true,
      message: 'User Fetched Successfully',
      response: { data: userData },
    };
  }

  async findUserRolePermissions(req: Request) {
    const user_id = req['user_id'];

    const userRoles = await global.DB.UserRole.findAll({
      where: { user_id },
    });
    let userRolesArr = userRoles.map((item: any) => item.role_id);

    const userRolePermission = await global.DB.RolePermission.findAll({
      where: { role_id: { [Op.in]: userRolesArr } },
    });
    let userPermissionsArr = userRolePermission.map(
      (item: any) => item.permission_id,
    );

    const [roles, permissions] = await Promise.all([
      global.DB.Role.findAll({
        where: { id: { [Op.in]: userRolesArr } },
        attributes: ['id', 'name', 'priority'],
      }),
      global.DB.Permission.findAll({
        where: { id: { [Op.in]: userPermissionsArr } },
        attributes: ['id', 'name', 'path', 'method'],
      }),
    ]);

    return {
      message: 'Role and Permission fetched successfully',
      success: true,
      response: { data: { roles, permissions } },
    };
  }
}
