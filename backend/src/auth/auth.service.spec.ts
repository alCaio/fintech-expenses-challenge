import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { mock, MockProxy } from 'jest-mock-extended';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let usersService: MockProxy<UsersService>;
  let jwtService: MockProxy<JwtService>;
  let service: AuthService;

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    name: 'Ana',
    email: 'ana@example.com',
    passwordHash: bcrypt.hashSync('secret123', 4),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  });

  beforeEach(() => {
    usersService = mock<UsersService>();
    jwtService = mock<JwtService>();
    jwtService.signAsync.mockResolvedValue('signed-token');
    service = new AuthService(usersService, jwtService);
  });

  describe('register', () => {
    it('rejects an email that is already registered', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          name: 'Ana',
          email: 'ana@example.com',
          password: 'secret123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('stores a bcrypt hash instead of the plain password and returns a token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((data) =>
        Promise.resolve(buildUser({ ...data })),
      );

      const result = await service.register({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'secret123',
      });

      const { passwordHash } = usersService.create.mock.calls[0][0];
      expect(passwordHash).not.toBe('secret123');
      await expect(bcrypt.compare('secret123', passwordHash)).resolves.toBe(
        true,
      );
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'ana@example.com',
      });
    });
  });

  describe('login', () => {
    it('returns the same 401 for unknown email and wrong password', async () => {
      usersService.findByEmail.mockResolvedValueOnce(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'secret123' }),
      ).rejects.toThrow(new UnauthorizedException('E-mail ou senha inválidos'));

      usersService.findByEmail.mockResolvedValueOnce(buildUser());
      await expect(
        service.login({ email: 'ana@example.com', password: 'wrong-pass1' }),
      ).rejects.toThrow(new UnauthorizedException('E-mail ou senha inválidos'));

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('returns a token for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      const result = await service.login({
        email: 'ana@example.com',
        password: 'secret123',
      });

      expect(result).toEqual({
        accessToken: 'signed-token',
        user: {
          id: 'user-1',
          name: 'Ana',
          email: 'ana@example.com',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      });
    });
  });
});
