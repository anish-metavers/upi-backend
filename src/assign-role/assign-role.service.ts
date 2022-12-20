import { HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Op } from 'sequelize';
import { AssignRoleDto } from './dto/assignRole.dto';

@Injectable()
export class AssignRoleService {
  async addRole(req: Request, user_id: number, updateUserDto: AssignRoleDto) {
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
    let maxGuardUserRole = guardUserRoles[0];
    for (let guard_role of guardUserRoles) {
      if (guard_role.role_data.priority > maxGuardUserRole.role_data.priority)
        maxGuardUserRole = guard_role;
    }

    for (let role of checkRoles) {
      if (maxGuardUserRole.role_data.priority <= role.priority)
        throw new HttpException(
          { message: 'You can not create user above your Role!!' },
          400,
        );
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
    // console.log('Data:', data);
    const rolesAdded = await global.DB.UserRole.bulkCreate(data);

    return { success: true, message: 'User Role updated Successfully!!' };
  }

  async replaceRole(
    req: Request,
    user_id: number,
    updateUserDto: AssignRoleDto,
  ) {
    const { roles } = updateUserDto;

    if (roles.length <= 0)
      throw new HttpException({ message: 'Roles are Invalid: Empty!!' }, 400);

    const [user, checkRole] = await Promise.all([
      global.DB.User.findOne({ where: { id: user_id } }),
      global.DB.Role.findOne({ where: { id: roles[0] } }),
    ]);
    if (!user)
      throw new HttpException(
        { message: 'No User Found with the Given Id!!' },
        404,
      );
    if (!checkRole)
      throw new HttpException({ message: 'No Role found with this Id.' }, 404);

    await Promise.all([
      global.DB.UserRole.destroy({ where: { user_id } }),
      global.DB.UserRole.create({ user_id, role_id: roles[0] }),
    ]);

    return { success: true, message: 'Roles Replaced Successfully!!' };
  }

  async removeRole(
    req: Request,
    user_id: number,
    updateUserDto: AssignRoleDto,
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

    const userRoles = await global.DB.UserRole.findAll({ where: { user_id } });
    if (userRoles.length < 2)
      throw new HttpException(
        { message: 'At Least One Role is Required' },
        401,
      );

    await global.DB.UserRole.destroy({
      where: { user_id, role_id: { [Op.in]: roles } },
    });

    return { success: true, message: 'Roles Deleted Successfully!!' };
  }
}
