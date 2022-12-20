import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'guard/auth.guard';
import { DashboardService } from './dashboard.service';
import { ClientWiseTrxnStatQuery } from './dto/query.dto';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('client-wise-trxn-stats')
  async getClientWiseTrxnStats(
    @Req() req: Request,
    @Query() query: ClientWiseTrxnStatQuery,
  ) {
    return await this.dashboardService.getClientWiseTrxnStats(req, query);
  }
}
