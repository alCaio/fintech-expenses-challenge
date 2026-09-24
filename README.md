# Fintech Expenses

Plataforma interna para colaboradores registrarem e acompanharem movimentações financeiras por categoria (despesas operacionais, receitas de clientes, reembolsos etc.).

- **Deploy:** https://SEU-SERVICO.onrender.com
- **Documentação da API (Swagger):** https://SEU-SERVICO.onrender.com/api/docs
- **Repositório:** https://github.com/alCaio/fintech-expenses-challenge

### Usuário de teste

| E-mail | Senha |
| --- | --- |
| `demo@fintech.com` | `Demo@1234` |

> No plano gratuito do Render o serviço hiberna após inatividade; a primeira requisição pode levar ~50s.

---

## Stack

| Camada | Tecnologias |
| --- | --- |
| Backend | NestJS 11, TypeScript (strict), Prisma 6, PostgreSQL, JWT (`@nestjs/jwt` + Passport), class-validator |
| Frontend | React 19, TypeScript (strict), Vite, React Router 7, TanStack React Query 5, Axios, react-hook-form |
| Testes | Jest, jest-mock-extended, Supertest |
| Infra | Render (web service + PostgreSQL), Docker Compose para o banco local |

## Funcionalidades

- **Autenticação:** cadastro e login com JWT. Todas as rotas são protegidas por padrão e cada usuário acessa apenas os próprios dados.
- **Categorias:** CRUD completo. O nome é único por usuário, sem diferenciar maiúsculas de minúsculas. Uma categoria com transações não pode ser excluída (409).
- **Transações:** criação, edição e exclusão, com listagem paginada e filtros por tipo, categoria e período.
- **Dashboard:** saldo atual, total de entradas e de saídas no período e as 3 categorias com maior volume de saídas. Todo o cálculo é feito no banco.
- **Feedback visual:** toasts de sucesso e erro, validação nos formulários, estados de carregamento, vazio e erro.

## Decisões técnicas

### Gerenciamento de estado: React Query + Context API

Quase todo o estado desta aplicação é **estado do servidor**: categorias, transações e indicadores do dashboard. O problema a resolver é cache, invalidação e estados de carregamento e erro, não compartilhamento de estado entre componentes. Por isso:

- **React Query** cuida de todo dado vindo da API. Cada mutação invalida as queries afetadas. Criar uma transação, por exemplo, invalida a lista de transações e o dashboard. Assim a interface fica sempre coerente com o backend, sem sincronização manual. O `keepPreviousData` evita que a tela "pisque" ao trocar de página ou de filtro.
- **Context API** guarda apenas a sessão (usuário autenticado, login e logout). É um estado pequeno, global e que muda pouco, e para isso o Context basta.
- **Filtros da listagem ficam na URL** (`useSearchParams`). Com isso o estado do filtro sobrevive a um refresh e pode ser compartilhado por link, sem precisar de store.

Redux ou Zustand acrescentariam uma camada de código sem resolver nenhum problema que essas duas ferramentas já não resolvem.

### Backend

- **Módulos com responsabilidade única:** `AuthModule`, `UsersModule`, `CategoriesModule`, `TransactionsModule` e `DashboardModule`, além do `PrismaModule` global. O `TransactionsModule` importa o `CategoriesModule` para validar a posse da categoria, sem acessar a tabela de outro módulo diretamente.
- **Guard global com opt-out:** o `JwtAuthGuard` é registrado como `APP_GUARD`, e as rotas públicas (login, registro, health) usam `@Public()`. Assim a proteção vale por padrão e não depende de lembrar de pôr um decorator em cada controller.
- **Autorização por usuário:** toda consulta filtra por `userId`. Recurso de outro usuário retorna **404**, e não 403, para não revelar que ele existe.
- **Respostas padronizadas:**
  - Sucesso: `{ data }` ou, na listagem paginada, `{ data, meta: { page, limit, total, totalPages } }`, montado pelo `ResponseInterceptor`.
  - Erro: `{ statusCode, error, message, path, timestamp }`, montado pelo `AllExceptionsFilter`. Erros conhecidos do Prisma são convertidos: P2002 vira 409, P2003 vira 409 e P2025 vira 404.
- **DTOs** de entrada validados com class-validator. O `ValidationPipe` usa `whitelist` e `forbidNonWhitelisted`, então campos desconhecidos geram 400. Os DTOs de saída são explícitos (`fromEntity`), e por isso campos como `passwordHash` nunca aparecem na resposta.
- **Dinheiro:** a coluna é `DECIMAL(14,2)`, as somas usam `Prisma.Decimal`, e a conversão para `number` acontece só na resposta. Isso evita erro de ponto flutuante na agregação.
- **Datas:** a coluna `DATE` recebe o formato `YYYY-MM-DD`, validado por um decorator próprio (`@IsDateOnly`). Isso evita problemas de fuso na borda do período.
- **Dashboard no banco:** usa `groupBy` com `_sum` por tipo, tanto para todo o histórico quanto para o período, e `groupBy` por categoria com `orderBy _sum desc, take 3`. As três consultas rodam em paralelo.
- **Variáveis de ambiente** são validadas no boot. A aplicação não sobe com `.env` inválido.
- **TypeScript** em `strict: true` completo, sem desligar nenhuma flag. O ESLint trata `no-explicit-any` como erro.

### Deploy em um único serviço

Em produção, o NestJS serve o build do React (`@nestjs/serve-static`) e a API fica sob `/api`. Isso significa um link só, sem CORS em produção e um único serviço para manter. Em desenvolvimento, o Vite faz proxy de `/api` para o backend. O frontend também aceita `VITE_API_URL` caso seja publicado separadamente, por exemplo na Vercel, e o backend tem CORS configurável via `CORS_ORIGIN`.

### O que ficou de fora de propósito

Refresh token, RBAC, soft delete, filas e cache distribuído. Nada disso é pedido pelo escopo, e cada um acrescentaria complexidade sem ganho para o MVP.

## Estrutura

```
backend/
  prisma/               schema, migrations e seed
  src/
    auth/               registro, login, JWT strategy, guard global
    users/              perfil do usuário autenticado
    categories/         CRUD de categorias
    transactions/       CRUD, filtros e paginação
    dashboard/          indicadores agregados
    common/             interceptor, filtro de exceções, decorators, DTOs e utilitários compartilhados
    prisma/             PrismaService
  test/                 teste e2e
frontend/
  src/
    api/                cliente Axios e funções por recurso
    auth/               AuthProvider, useAuth e guards de rota
    hooks/              hooks do React Query e filtros na URL
    components/         componentes por domínio e componentes de UI
    pages/              páginas roteadas
    types/              tipos de domínio e da API
```

## Endpoints

Todas as rotas usam o prefixo `/api`. As rotas marcadas com 🔒 exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/register` | Cria usuário e retorna o token (201) |
| POST | `/auth/login` | Autentica e retorna o token (200) |
| GET | `/users/me` 🔒 | Usuário autenticado |
| GET / POST | `/categories` 🔒 | Lista ou cria categorias |
| GET / PATCH / DELETE | `/categories/:id` 🔒 | Detalha, edita ou exclui (204) |
| GET | `/transactions?page&limit&type&categoryId&startDate&endDate` 🔒 | Lista paginada com filtros |
| POST | `/transactions` 🔒 | Cria uma transação |
| GET / PATCH / DELETE | `/transactions/:id` 🔒 | Detalha, edita ou exclui (204) |
| GET | `/dashboard/summary?startDate&endDate` 🔒 | Indicadores do dashboard |
| GET | `/health` | Health check |

## Como rodar localmente

### Pré-requisitos

- Node.js 20 ou superior (testado com 22 e 24) e npm
- PostgreSQL 14 ou superior, ou Docker para subir o banco com o `docker-compose.yml`

### 1. Banco de dados

```bash
docker compose up -d
```

Se preferir, use um PostgreSQL próprio e ajuste a `DATABASE_URL` no passo seguinte.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # ajuste as variáveis se necessário
npm run db:deploy           # aplica as migrations (em desenvolvimento: npm run db:migrate)
npm run db:seed             # cria o usuário demo com dados de exemplo
npm run start:dev           # http://localhost:3000/api  (Swagger em /api/docs)
```

Variáveis de ambiente (`backend/.env`):

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://postgres:postgres@localhost:5432/fintech?schema=public` |
| `JWT_SECRET` | Segredo de assinatura do JWT (mínimo de 16 caracteres) | `uma-string-longa-e-aleatoria` |
| `JWT_EXPIRES_IN` | Validade do token | `1d` |
| `PORT` | Porta HTTP | `3000` |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula | `http://localhost:5173` |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Nenhuma variável é necessária em desenvolvimento, porque o Vite encaminha `/api` para `localhost:3000`. Para apontar para outra API, crie `frontend/.env` com `VITE_API_URL`.

### Testes

```bash
cd backend
npm test                    # testes unitários (sem banco)
npm run test:e2e            # e2e: usa a DATABASE_URL do .env; prefira um banco separado
```

O que os testes cobrem:

- **Auth:** e-mail duplicado; senha salva como hash; o mesmo 401 para e-mail inexistente e para senha errada.
- **Categorias:** isolamento por usuário; nome único sem diferenciar maiúsculas; bloqueio de exclusão quando a categoria está em uso.
- **Transações:** montagem de filtros e paginação; período inválido; categoria de outro usuário; posse na edição e na exclusão.
- **Dashboard:** somas com decimais sem erro de arredondamento; top 3 categorias; estado vazio.
- **E2E**, contra PostgreSQL real: autenticação, validação, isolamento entre dois usuários, filtros, dashboard e regra de exclusão de categoria.

## Deploy (Render)

O arquivo `render.yaml` define um PostgreSQL e um web service:

1. No Render, escolha **New → Blueprint** e selecione este repositório.
2. O Render cria o banco, gera o `JWT_SECRET` automaticamente e faz o build do frontend e do backend.
3. Ao iniciar, o serviço executa `prisma migrate deploy` e o seed, que é idempotente, e depois sobe a API servindo o frontend.
