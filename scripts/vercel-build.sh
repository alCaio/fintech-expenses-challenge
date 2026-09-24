#!/bin/sh
set -e

npm run build --prefix backend
DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npm run db:deploy --prefix backend
DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npm run db:seed --prefix backend
npm run build --prefix frontend
