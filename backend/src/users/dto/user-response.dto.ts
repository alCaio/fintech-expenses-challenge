import { User } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
