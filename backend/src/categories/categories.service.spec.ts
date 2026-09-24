import { ConflictException, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let prisma: DeepMockProxy<PrismaService>;
  let service: CategoriesService;

  const category: Category = {
    id: 'cat-1',
    name: 'Alimentação',
    description: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    service = new CategoriesService(prisma);
  });

  it('scopes lookups by the authenticated user and returns 404 for foreign categories', async () => {
    prisma.category.findFirst.mockResolvedValue(null);

    await expect(service.findOne('user-2', 'cat-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'cat-1', userId: 'user-2' },
    });
  });

  it('rejects a duplicated name for the same user ignoring case', async () => {
    prisma.category.findFirst.mockResolvedValue(category);

    await expect(
      service.create('user-1', { name: 'alimentação' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.category.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          name: { equals: 'alimentação', mode: 'insensitive' },
        },
      }),
    );
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it('refuses to delete a category that still has transactions', async () => {
    prisma.category.findFirst.mockResolvedValue(category);
    prisma.transaction.count.mockResolvedValue(3);

    await expect(service.remove('user-1', 'cat-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.category.delete).not.toHaveBeenCalled();
  });
});
