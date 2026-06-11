import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Wallet } from './wallet.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Index({ unique: true })
  @Column({ length: 100 })
  referenceId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'bigint' })
  balanceBefore: number;

  @Column({ type: 'bigint' })
  balanceAfter: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}