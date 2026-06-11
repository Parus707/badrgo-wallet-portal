import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  PKR = 'PKR',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: Currency, default: Currency.USD })
  currency: Currency;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (tx) => tx.wallet)
  transactions: Transaction[];
}
