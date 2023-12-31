import {
  Controller,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import {
  ClientListDto,
  ClientUpiListDto,
  CreateClientDto,
  CreateClientUpiDto,
} from './dto/create-client.dto';
import { UpdateClientDto, UpdateClientUpiDto } from './dto/update-client.dto';
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { PermissionGuard } from 'guard/permission.guard';

@Controller('client')
@UseGuards(AuthGuard, PermissionGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: ClientListDto) {
    return await this.clientService.findAll(req, query);
  }

  @Post()
  async createClient(
    @Req() req: Request,
    @Body() createClientDto: CreateClientDto,
  ): Promise<{
    success: boolean;
    response: { data: { id: any; name: any; email: any } };
    message: string;
  }> {
    return await this.clientService.createClient(createClientDto, req);
  }

  @Patch(':client_id')
  update(
    @Req() req: Request,
    @Param('client_id') client_id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.updateClient(req, +client_id, updateClientDto);
  }

  @Post('/upi/create')
  async createClientUpi(
    @Req() req: Request,
    @Body() createClientDto: CreateClientUpiDto,
  ) {
    return await this.clientService.createClientUpi(req, createClientDto);
  }

  @Patch('/upi/update/:client_upi_id')
  async updateClientUpiStatus(
    @Req() req: Request,
    @Param('client_upi_id') client_upi_id: number,
    @Body() updateClientDto: UpdateClientUpiDto,
  ) {
    const updateClient = await this.clientService.updateClientUpiStatus(
      req,
      client_upi_id,
      updateClientDto,
    );
    return updateClient;
  }

  @Get('/upi/list')
  async getClientUpiList(
    @Req() req: Request,
    @Query() query: ClientUpiListDto,
  ) {
    const clientList = await this.clientService.getClientUpiList(req, query);
    return clientList;
  }
}
