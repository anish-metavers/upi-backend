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

    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid' }, 400);

    const checkUser = await global.DB.User.findOne({ where: { email } });
    if (checkUser)
      throw new HttpException({ message: 'User already exists' }, 400);

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

    return {
      success: true,
      message: 'User Created Successfully',
      response: {
        data: user.toJSON(),
        roles: rolesCreated.map((item: any) => item.toJSON()),
      },
    };
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
      success: true,
      message: 'User List Fetched Successfully',
      response: {
        data: usersData,
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

  async updateRole(
    req: Request,
    user_id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const { roles } = updateUserDto;
    const guard_user_id = req['user_id'];

    // Validate Roles
    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid: Empty!!' }, 400);

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
            { message: 'You can not add Role above your own Role!!' },
            400,
          );
      }
    }

    const user = await global.DB.User.findOne({ where: { id: user_id } });
    if (!user)
      throw new HttpException(
        { message: 'No User Found with the Given Id!!' },
        404,
      );

    const userRoles = await global.DB.UserRole.findAll({ where: { user_id } });
    const userRolesArr = userRoles.map((item: any) => item.role_id);

    const rolesToAdd = [];

    for (let role of roles) {
      if (!userRolesArr.includes(role)) rolesToAdd.push(role);
    }

    if (rolesToAdd.length <= 0)
      return { message: 'Roles Already Exists on User!!' };
    const data = rolesToAdd.map((item) => {
      return { user_id, role_id: item };
    });
    console.log('Data:', data);
    const rolesAdded = await global.DB.UserRole.bulkCreate(data);

    return { success: true, message: 'User Role updated Successfully!!' };
  }

  async removeRole(
    req: Request,
    user_id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const { roles } = updateUserDto;

    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid: Empty!!' }, 400);

    const user = await global.DB.User.findOne({ where: { id: user_id } });
    if (!user)
      throw new HttpException(
        { message: 'No User Found with the Given Id!!' },
        404,
      );

    // const userRoles = await global.DB.UserRole.findAll({ where: { user_id } });

    await global.DB.UserRole.destroy({
      where: { user_id, role_id: { [Op.in]: roles } },
    });

    return { success: true, message: 'Roles Deleted Successfully!!' };
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