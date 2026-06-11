import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { ReportsModule } from './reports/reports.module';

import { User } from './users/entities/user.entity';
import { Wallet } from './wallets/entities/wallet.entity';
import { Transaction } from './wallets/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get('DB_USER') || 'postgres',
        password: config.get('DB_PASSWORD') || 'postgres',
        database: config.get('DB_NAME') || 'wallet_portal',

        entities: [User, Wallet, Transaction],

        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    UsersModule,
    WalletsModule,
    ReportsModule,
  ],
})
export class AppModule {}