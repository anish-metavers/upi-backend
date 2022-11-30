import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserUpiDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import Role from 'model/role';
import { Request } from 'express';

@Injectable()
export class UserService {
  async create(req: Request, createUserDto: CreateUserDto) {
    const { client_id, firstName, lastName, email, password, roles } =
      createUserDto;
    const guard_user_id = req['user_id'];

    let CLIENT_ID: string | number;

    if (!req['isMaster']) CLIENT_ID = req['client_id'];

    if (!client_id && !CLIENT_ID)
      throw new HttpException({ message: 'Please provide a Client Id!!' }, 404);

    if (!CLIENT_ID && req['isMaster']) {
      const client = await global.DB.Client.findOne({
        where: { id: client_id },
        attributes: ['id'],
      });
      if (!client)
        throw new HttpException({ message: 'Client not found' }, 404);
      CLIENT_ID = client_id;
    }

    const checkUser = await global.DB.User.findOne({ where: { email } });
    if (checkUser)
      throw new HttpException({ message: 'User already exists' }, 400);

    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    // Validate Roles
    const checkRoles = await global.DB.Role.findAll({
      where: { id: { [Op.in]: roles } },
    });
    if (checkRoles.length !== roles.length)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    // Validate User Role and Guard Role
    const guardUserRoles = await global.DB.UserRole.findAll({
      where: { user_id: guard_user_id },
      include: {
        model: global.DB.Role,
        as: 'role_data',
        attributes: ['id', 'name', 'priority'],
      },
    });
    for (let role of checkRoles) {
      for (let guard_role of guardUserRoles) {
        if (guard_role.role_data.priority <= role.priority)
          throw new HttpException(
            { message: 'You can not create user above your Role!!' },
            400,
          );
      }
    }

    const hashedPassword = password; //await bcrypt.hash(password, 10);

    const user = await global.DB.User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      client_id: CLIENT_ID,
    });

    // Create Roles
    const rolesData = roles.map((item) => {
      return { user_id: user.id, role_id: item };
    });
    const rolesCreated = await global.DB.UserRole.bulkCreate(rolesData);

    return { message: 'User Created Successfully', data: user, rolesCreated };
  }

  async findAll(req: Request) {
    const users = await global.DB.User.findAll({
      where: {},
      attributes: { exclude: ['createdAt', 'updatedAt', 'password'] },
    });

    const userRoles = await global.DB.UserRole.findAll({
      where: { user_id: { [Op.in]: users.map((user: any) => user.id) } },
      include: {
        model: global.DB.Role,
        as: 'role_data',
        attributes: ['id', 'name', 'priority'],
      },
    });
    let usersData = [];

    for (let user of users) {
      user = user.toJSON();
      let tempRoles = [];
      userRoles
        .filter((item: any) => item.user_id == user.id)
        .map((item: any) => {
          tempRoles.push({ ...item.toJSON().role_data });
        });
      user.roles = tempRoles;
      usersData.push(user);
    }

    return {
      message: 'User List Fetched Successfully',
      data: usersData,
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

    return { message: 'User Fetched Successfully', data: userData };
  }

  async updateRole(
    req: Request,
    user_id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const { roles } = updateUserDto;
    const guard_user_id = req['user_id'];

    // Validate Roles
    const checkRoles = await global.DB.Role.findAll({
      where: { id: { [Op.in]: roles } },
    });
    if (checkRoles.length !== roles.length)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    // Validate User Role and Guard Role
    const guardUserRoles = await global.DB.UserRole.findAll({
      where: { user_id: guard_user_id },
      include: {
        model: global.DB.Role,
        as: 'role_data',
        attributes: ['id', 'name', 'priority'],
      },
    });

    for (let role of checkRoles) {
      for (let guard_role of guardUserRoles) {
        if (guard_role.role_data.priority <= role.priority)
          throw new HttpException(
            { message: 'You can not create user above your Role!!' },
            400,
          );
      }
    }
  }

  removeRole(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUpi(
    req: Request,
    user_id: number,
    updateUserUpiDto: UpdateUserUpiDto,
  ) {
    const { upis } = updateUserUpiDto;
    return {};
  }

  async removeUpi(
    req: Request,
    user_id: number,
    updateUserUpiDto: UpdateUserUpiDto,
  ) {
    const { upis } = updateUserUpiDto;
    return {};
  }
}
