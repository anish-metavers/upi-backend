import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';
import { AssignPortalService } from './assign-portal.service';
import { AssignPortalDto, UserPortalQueryDto } from './dto/assignPortal.dto';

@Controller('assign-portal')
@UseGuards(AuthGuard, PermissionGuard)
export class AssignPortalController {
  constructor(private readonly assignPortalService: AssignPortalService) {}

  @Get()
  async getAllUserPortal(
    @Req() req: Request,
    @Query() query: UserPortalQueryDto,
  ) {
    return await this.assignPortalService.getAllUserPortal(req, query);
  }

  @Post(':user_id')
  async assignPortal(
    @Req() req: Request,
    @Param('user_id') user_id: string,
    @Body() body: AssignPortalDto,
  ) {
    return await this.assignPortalService.assignPortal(req, user_id, body);
  }

  @Delete(':user_portal_id')
  async removePortal(
    @Req() req: Request,
    @Param('user_portal_id') user_portal_id: string,
  ) {
    return await this.assignPortalService.removePortal(req, user_portal_id);
  }
}
