import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Transaction, TransactionType } from '../wallets/entities/transaction.entity';
import { Wallet, WalletStatus } from '../wallets/entities/wallet.entity';

export interface DailySummaryEntry {
  date: string;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  activeWallets: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,

    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
  ) {}

  async getDailyReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : this.daysAgo(7);
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date();

    const transactions = await this.txRepo.find({
      where: { createdAt: Between(start, end) },
      order: { createdAt: 'ASC' },
    });

    const activeWallets = await this.walletRepo.count({
      where: { status: WalletStatus.ACTIVE },
    });

    const map = new Map();

    for (const t of transactions) {
      const key = t.createdAt.toISOString().slice(0, 10);

      const current = map.get(key) || {
        credits: 0,
        debits: 0,
        count: 0,
      };

      current.count++;

      if (t.type === TransactionType.CREDIT) {
        current.credits += Number(t.amount);
      } else {
        current.debits += Number(t.amount);
      }

      map.set(key, current);
    }

    return Array.from(map.entries()).map(([date, stats]) => ({
      date,
      totalCredits: stats.credits,
      totalDebits: stats.debits,
      transactionCount: stats.count,
      activeWallets,
    }));
  }

  async getSummaryStats() {
    const wallets = await this.walletRepo.find();
    const totalBalance = wallets.reduce((a, b) => a + Number(b.balance), 0);

    const [txs, count] = await this.txRepo.findAndCount();

    let credits = 0;
    let debits = 0;

    for (const t of txs) {
      if (t.type === TransactionType.CREDIT) credits += Number(t.amount);
      else debits += Number(t.amount);
    }

    return {
      totalWallets: wallets.length,
      totalBalance,
      totalCredits: credits,
      totalDebits: debits,
      transactionCount: count,
    };
  }

  private daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}