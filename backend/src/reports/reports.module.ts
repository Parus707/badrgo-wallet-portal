import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from '../wallets/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
