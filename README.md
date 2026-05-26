# Proclamai 360

Sistema interno de gestao para igrejas, construido com React, Vite, Styled Components, Vercel Functions, Prisma ORM e Supabase PostgreSQL.

## Stack

- Frontend: React, Vite, JavaScript, Styled Components, React Router DOM, Axios
- Backend: Vercel Serverless Functions em `api/`
- Banco: Supabase PostgreSQL
- ORM: Prisma
- Auth: JWT e bcryptjs

## Primeiros passos

```bash
npm install
npm run prisma:generate
npm run dev
```

Para testar frontend e funcoes serverless no mesmo servidor local:

```bash
npm run vercel:dev
```

## Variaveis de ambiente

Copie `.env.example` para `.env` e configure:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
VITE_API_BASE_URL="/api"
```

Use `DATABASE_URL` com pooler do Supabase para runtime serverless. Use `DIRECT_URL` para migrations Prisma.

## Banco de dados

```bash
npm run prisma:migrate
npm run db:seed
```

Usuarios administradores do seed:

- E-mail: `renato@proclamai.com.br`
- Senha: `admin123@`
- E-mail: `admin@proclamai.local`
- Senha: `proclamai123`

Em producao ou preview na Vercel, use migrations ja versionadas:

```bash
npm run prisma:deploy
```

## Rotas da API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`

## Arquitetura

```txt
api/
  auth/             rotas de autenticacao
  users/            rotas de usuario autenticado
  health/           healthcheck
  shared/           helpers puros da API
  middlewares/      middlewares futuros

prisma/
  schema.prisma
  migrations/
  seeds/

src/
  components/       componentes reutilizaveis e sem regra de dominio
  modules/          dominios da aplicacao
  layouts/          shells e estruturas de pagina
  routes/           composicao de rotas
  services/         clientes externos compartilhados
  contexts/         contextos globais, quando realmente globais
  hooks/            hooks globais
  lib/              adaptadores pequenos
  styles/           tema e estilos globais
  utils/            funcoes puras
  constants/        constantes compartilhadas
  config/           configuracoes de runtime
```

## Padrao para novos modulos

Cada modulo deve nascer com a mesma estrutura:

```txt
src/modules/nome-do-modulo/
  pages/
  components/
  services/
  hooks/
  context/
  routes/
```

Regras praticas:

- Componentes globais ficam em `src/components`.
- Componentes com regra de negocio ficam dentro do modulo.
- Services do modulo chamam `apiClient`, mas nao importam componentes.
- Paginas orquestram hooks e componentes, evitando regra pesada no JSX.
- Um modulo nao deve importar arquivos internos de outro modulo sem uma decisao explicita de arquitetura.

## Fluxo de autenticacao

1. `LoginPage` chama `authenticate` do `AuthContext`.
2. `AuthContext` usa `authService`.
3. `authService` usa `apiClient`.
4. O token JWT fica em `localStorage`.
5. `ProtectedRoute` bloqueia rotas privadas.
6. `GET /api/users/me` restaura sessao ao recarregar a pagina.

## Proximas etapas recomendadas

1. Conectar o Supabase e rodar a primeira migration.
2. Validar deploy na Vercel com as variaveis configuradas.
3. Implementar CRUD de membros como primeiro modulo real.
4. Adicionar testes focados na autenticacao e services.
