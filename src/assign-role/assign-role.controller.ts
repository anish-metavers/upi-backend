import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';
import { Request } from 'express';
import { AssignRoleService } from './assign-role.service';
import { AssignRoleDto } from './dto/assignRole.dto';

@Controller('assign-role')
@UseGuards(AuthGuard)
export class AssignRoleController {
  constructor(private readonly assignRoleService: AssignRoleService) {}

  @Post(':user_id')
  async addRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: AssignRoleDto,
  ) {
    return await this.assignRoleService.addRole(req, +user_id, updateUserDto);
  }

  @Patch(':user_id')
  replaceRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: AssignRoleDto,
  ) {
    return this.assignRoleService.replaceRole(req, +user_id, updateUserDto);
  }

  @Delete(':user_id')
  removeRole(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: AssignRoleDto,
  ) {
    return this.assignRoleService.removeRole(req, +user_id, updateUserDto);
  }
}
