import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { createApp } from './app.factory';

const REWRITE_PARAM = 'path';

let server: Promise<Express> | undefined;

async function bootstrap(): Promise<Express> {
  const instance = express();
  const app = await createApp(new ExpressAdapter(instance));
  await app.init();
  return instance;
}

function stripRewriteParam(url: string): string {
  const parsed = new URL(url, 'http://localhost');
  parsed.searchParams.delete(REWRITE_PARAM);
  return `${parsed.pathname}${parsed.search}`;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  server ??= bootstrap();
  const app = await server;
  req.url = stripRewriteParam(req.url);
  app(req, res);
}
