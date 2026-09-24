import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';

const FRONTEND_DIST = join(__dirname, '..', '..', 'frontend', 'dist');

function frontendModule(): DynamicModule[] {
  if (!existsSync(FRONTEND_DIST)) return [];
  return [
    ServeStaticModule.forRoot({
      rootPath: FRONTEND_DIST,
      exclude: ['/api/{*path}'],
    }),
  ];
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
    ...frontendModule(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
