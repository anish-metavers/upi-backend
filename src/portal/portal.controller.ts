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
import { PortalService } from './portal.service';
import { CreatePortalDto, PortalFindDto } from './dto/create-portal.dto';
import { UpdatePortalDto } from './dto/update-portal.dto';
import { AuthGuard } from 'guard/auth.guard';
import { Request } from 'express';
import { PermissionGuard } from 'guard/permission.guard';

@Controller('portal')
@UseGuards(AuthGuard, PermissionGuard)
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post()
  async create(@Req() req: Request, @Body() createPortalDto: CreatePortalDto) {
    return await this.portalService.create(req, createPortalDto);
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: PortalFindDto) {
    return await this.portalService.findAll(req, query);
  }

  @Get(':portal_id')
  async findOne(
    @Req() req: Request,
    @Param('portal_id') portal_id: string,
    @Query() query: PortalFindDto,
  ) {
    return await this.portalService.findOne(req, +portal_id, query);
  }

  @Patch(':portal_id')
  async update(
    @Req() req: Request,
    @Param('portal_id') portal_id: string,
    @Body() updatePortalDto: UpdatePortalDto,
  ) {
    return this.portalService.update(req, +portal_id, updatePortalDto);
  }
}
