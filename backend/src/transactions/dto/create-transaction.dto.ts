import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateOnly } from '../../common/validators/is-date-only.decorator';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';

export const MAX_TRANSACTION_AMOUNT = 999_999_999_999.99;

export class CreateTransactionDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(MAX_TRANSACTION_AMOUNT)
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsDateOnly()
  date!: string;

  @IsUUID()
  categoryId!: string;
}
