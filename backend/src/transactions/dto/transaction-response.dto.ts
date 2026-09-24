import { Category, Transaction, TransactionType } from '@prisma/client';
import { formatDateOnly } from '../../common/utils/date.util';

export type TransactionWithCategory = Transaction & {
  category: Pick<Category, 'id' | 'name'>;
};

export class TransactionCategoryDto {
  id!: string;
  name!: string;
}

export class TransactionResponseDto {
  id!: string;
  description!: string;
  amount!: number;
  type!: TransactionType;
  date!: string;
  category!: TransactionCategoryDto;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(
    transaction: TransactionWithCategory,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      date: formatDateOnly(transaction.date),
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
      },
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
