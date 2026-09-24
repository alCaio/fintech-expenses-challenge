import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Transaction } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
import { PaginatedResult } from '../common/pagination/paginated-result';
import { toDateRangeFilter } from '../common/utils/date-range.util';
import { parseDateOnly } from '../common/utils/date.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

const includeCategory = {
  category: { select: { id: true, name: true } },
} satisfies Prisma.TransactionInclude;

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    await this.categoriesService.findOwned(userId, dto.categoryId);

    const transaction = await this.prisma.transaction.create({
      data: {
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        type: dto.type,
        date: parseDateOnly(dto.date),
        categoryId: dto.categoryId,
        userId,
      },
      include: includeCategory,
    });
    return TransactionResponseDto.fromEntity(transaction);
  }

  async findAll(
    userId: string,
    query: ListTransactionsQueryDto,
  ): Promise<PaginatedResult<TransactionResponseDto>> {
    const { page, limit, type, categoryId } = query;
    const where: Prisma.TransactionWhereInput = {
      userId,
      type,
      categoryId,
      date: toDateRangeFilter(query),
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: includeCategory,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return new PaginatedResult(
      transactions.map((transaction) =>
        TransactionResponseDto.fromEntity(transaction),
      ),
      total,
      page,
      limit,
    );
  }

  async findOne(userId: string, id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: includeCategory,
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return TransactionResponseDto.fromEntity(transaction);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    await this.findOwned(userId, id);
    if (dto.categoryId) {
      await this.categoriesService.findOwned(userId, dto.categoryId);
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        description: dto.description,
        type: dto.type,
        categoryId: dto.categoryId,
        amount:
          dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : undefined,
        date: dto.date !== undefined ? parseDateOnly(dto.date) : undefined,
      },
      include: includeCategory,
    });
    return TransactionResponseDto.fromEntity(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  private async findOwned(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
