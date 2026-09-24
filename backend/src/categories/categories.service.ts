import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.ensureNameAvailable(userId, dto.name);
    const category = await this.prisma.category.create({
      data: { ...dto, userId },
    });
    return CategoryResponseDto.fromEntity(category);
  }

  async findAll(userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return categories.map((category) =>
      CategoryResponseDto.fromEntity(category),
    );
  }

  async findOne(userId: string, id: string): Promise<CategoryResponseDto> {
    return CategoryResponseDto.fromEntity(await this.findOwned(userId, id));
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const current = await this.findOwned(userId, id);
    if (dto.name !== undefined && dto.name !== current.name) {
      await this.ensureNameAvailable(userId, dto.name);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    return CategoryResponseDto.fromEntity(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwned(userId, id);

    const transactionsCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });
    if (transactionsCount > 0) {
      throw new ConflictException(
        `A categoria possui ${transactionsCount} transação(ões) e não pode ser excluída`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
  }

  async findOwned(userId: string, id: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }

  private async ensureNameAvailable(
    userId: string,
    name: string,
  ): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`A categoria "${name}" já existe`);
    }
  }
}
