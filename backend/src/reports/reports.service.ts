import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TransactionType } from '../wallets/entities/transaction.entity';
import { Transaction } from '../wallets/entities/transaction.entity';
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
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async getDailySummary(startDate?: string, endDate?: string): Promise<DailySummaryEntry[]> {
    const start = startDate ? new Date(startDate) : this.daysAgo(7);
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date();

    const transactions = await this.transactionRepository.find({
      where: { createdAt: Between(start, end) },
      order: { createdAt: 'ASC' },
    });

    const activeWallets = await this.walletRepository.count({
      where: { status: WalletStatus.ACTIVE },
    });

    const byDate = new Map<string, { credits: number; debits: number; count: number }>();

    for (const tx of transactions) {
      const dateKey = tx.createdAt.toISOString().slice(0, 10);
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { credits: 0, debits: 0, count: 0 });
      }
      const entry = byDate.get(dateKey)!;
      entry.count += 1;
      if (tx.type === TransactionType.CREDIT) {
        entry.credits += Number(tx.amount);
      } else {
        entry.debits += Number(tx.amount);
      }
    }

    return Array.from(byDate.entries()).map(([date, stats]) => ({
      date,
      totalCredits: stats.credits,
      totalDebits: stats.debits,
      transactionCount: stats.count,
      activeWallets,
    }));
  }

  async getOverallStats() {
    const wallets = await this.walletRepository.find();
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const [allTransactions, totalCount] = await this.transactionRepository.findAndCount();

    const totalCredits = allTransactions
      .filter((t) => t.type === TransactionType.CREDIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebits = allTransactions
      .filter((t) => t.type === TransactionType.DEBIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalWallets: wallets.length,
      totalBalance,
      totalCredits,
      totalDebits,
      transactionCount: totalCount,
    };
  }

  private daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
