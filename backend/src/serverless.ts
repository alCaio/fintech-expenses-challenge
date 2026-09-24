import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { createApp } from './app.factory';

let server: Promise<Express> | undefined;

async function bootstrap(): Promise<Express> {
  const instance = express();
  const app = await createApp(new ExpressAdapter(instance));
  await app.init();
  return instance;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  server ??= bootstrap();
  const app = await server;
  app(req, res);
}
