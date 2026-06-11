import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily transaction summary. Defaults to last 7 days.' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Array of daily summary entries' })
  getDailySummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDailySummary(startDate, endDate);
  }

  @Get('overall-stats')
  @ApiOperation({ summary: 'Get overall platform stats for dashboard' })
  getOverallStats() {
    return this.reportsService.getOverallStats();
  }
}
