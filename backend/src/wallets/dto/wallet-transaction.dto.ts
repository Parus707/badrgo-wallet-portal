import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class WalletTransactionDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  referenceId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}