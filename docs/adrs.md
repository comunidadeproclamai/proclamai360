# Proclamai 360 — Registros de Decisão de Arquitetura (ADRs)

Este documento registra as decisões arquiteturais significativas tomadas para o **Proclamai 360**, com foco especial na infraestrutura distribuída utilizando **Vercel** e **Supabase**.

---

## Índice dos ADRs

1. [ADR 001: Arquitetura Modular no Frontend (React + Vite)](#adr-001-arquitetura-modular-no-frontend-react--vite)
2. [ADR 002: Backend Baseado em Vercel Serverless Functions](#adr-002-backend-baseado-em-vercel-serverless-functions)
3. [ADR 003: Banco de Dados em Nuvem com Supabase PostgreSQL e Connection Pooling](#adr-003-banco-de-dados-em-nuvem-com-supabase-postgresql-e-connection-pooling)
4. [ADR 004: Gerenciamento de Arquivos com Supabase Storage](#adr-004-gerenciamento-de-arquivos-com-supabase-storage)
5. [ADR 005: Autenticação Stateless via JWT vs Supabase Auth](#adr-005-autenticacao-stateless-via-jwt-vs-supabase-auth)
6. [ADR 006: Estilização e Tematização com Styled Components](#adr-006-estilizacao-e-tematizacao-com-styled-components)

---

## ADR 001: Arquitetura Modular no Frontend (React + Vite)

### Status
**Aceito**

### Contexto
O sistema gerencia múltiplos domínios eclesiásticos (Membros, Financeiro, Infantil, Louvor). Organizar o frontend de forma monolítica (todas as páginas e serviços agrupados por tipo) dificulta a manutenção e o deploy iterativo. A aplicação será servida via Vercel Edge Network.

### Decisão
Estruturação modular por domínio dentro de `src/modules/`.
- Cada módulo possui suas próprias `pages`, `components`, `services`, `hooks` e `routes`.
- Apenas componentes puramente visuais e genéricos residem em `src/components/`.
- O build é otimizado pelo **Vite**, gerando assets estáticos que a Vercel distribui globalmente via CDN, garantindo tempo de carregamento mínimo para a interface do usuário.

---

## ADR 002: Backend Baseado em Vercel Serverless Functions

### Status
**Aceito**

### Contexto
Para uma igreja, o tráfego do sistema é altamente sazonal (picos aos domingos e durante reuniões administrativas). Manter um servidor Node.js/Express rodando 24/7 (ex: AWS EC2, DigitalOcean) gera custos fixos. A plataforma de hospedagem escolhida é a Vercel.

### Decisão
Toda a lógica de backend reside no diretório `api/` utilizando **Vercel Serverless Functions**.
- Cada endpoint é isolado (stateless) e instanciado sob demanda pela Vercel AWS Lambda.
- O arquivo `vercel.json` gerencia o roteamento, enviando requisições não-API para o `index.html` do frontend React.

### Consequências (Trade-offs Vercel)
* **Prós**: Escalonamento automático instantâneo (zero a N); ausência de manutenção de servidor (NoOps); faturamento por tempo de execução (baixo custo).
* **Contras (Cold Starts)**: Funções ociosas podem demorar alguns milissegundos adicionais para responder na primeira requisição. O código das funções deve ser o mais leve possível.
* **Restrições**: Tempo máximo de execução limitado (geralmente 10 a 60 segundos dependendo do plano Vercel). Trabalhos pesados em background não são viáveis aqui sem filas assíncronas.

---

## ADR 003: Banco de Dados em Nuvem com Supabase PostgreSQL e Connection Pooling

### Status
**Aceito**

### Contexto
Serverless Functions (ADR 002) criam desafios severos para bancos de dados relacionais. Se 100 usuários acessarem o sistema simultaneamente, a Vercel pode subir 100 instâncias Lambda, cada uma abrindo conexões separadas com o PostgreSQL, esgotando rapidamente o limite de conexões do banco.

### Decisão
O banco de dados oficial é o **Supabase PostgreSQL**, acessado via **Prisma ORM**.
Para mitigar o problema de exaustão de conexões serverless, adotamos uma estratégia estrita de conexão dividida:
1. `DATABASE_URL`: Utiliza a porta de **Connection Pooler (PgBouncer)** do Supabase (porta 6543) com os parâmetros `?pgbouncer=true&connection_limit=1`. Isso garante que as funções Serverless da Vercel reutilizem as conexões ativas.
2. `DIRECT_URL`: Utiliza a porta direta (porta 5432) exclusivamente para o Prisma realizar as migrações de schema (`prisma migrate deploy`).

### Consequências
* **Prós**: Resiliência extrema contra picos de acesso de domingo; infraestrutura gerenciada e escalável; o Prisma Client opera em modo otimizado para serverless.
* **Contras**: Complexidade dupla de variáveis de ambiente.

---

## ADR 004: Gerenciamento de Arquivos com Supabase Storage

### Status
**Aceito**

### Contexto
O sistema precisará armazenar fotos de perfil de membros e comprovantes fiscais (PDFs, imagens) do módulo financeiro. O Vercel Serverless File System é efêmero (read-only em runtime) e não pode armazenar uploads duráveis.

### Decisão
Utilizaremos o **Supabase Storage** nativo (baseado em S3) para gerenciar todo o upload de mídias.
- Uploads serão feitos preferencialmente via presigned URLs diretamente do cliente (React) para o Supabase, poupando as funções Serverless da Vercel do tráfego pesado de arquivos.
- Os links públicos ou autenticados das imagens serão salvos nos campos de texto do banco de dados PostgreSQL (ex: `photoUrl`, `attachment`).

---

## ADR 005: Autenticação Stateless via JWT vs Supabase Auth

### Status
**Aceito**

### Contexto
O Supabase oferece sua própria solução robusta de autenticação (Supabase Auth / GoTrue). No entanto, o sistema atual foi construído e iniciado com uma gestão própria de usuários (`User` no Prisma) e tokens JWT autogerenciados nas funções Vercel.

### Decisão
Manteremos a **autenticação customizada via JWT (Stateless)** rodando no nosso backend Vercel, verificando as senhas com `bcryptjs` contra a tabela `users` do nosso próprio banco.

### Consequências
* **Prós**: Flexibilidade total sobre a modelagem de cargos (`role`), permissões e fluxos de login customizados para igrejas; Modo "Mock" de desenvolvimento (autenticação simulada offline) funciona perfeitamente sem o Supabase rodando localmente.
* **Contras**: Responsabilidade de gerenciar expiração de tokens e segurança criptográfica das senhas fica inteiramente sob nossa responsabilidade na camada da Vercel API. Não utilizaremos o RLS (Row Level Security) nativo do Supabase, gerenciando autorização via código no Prisma.

---

## ADR 006: Estilização e Tematização com Styled Components

### Status
**Aceito**

### Contexto
Sistemas administrativos eclesiásticos demandam interfaces limpas e organizadas. A adoção de frameworks como Tailwind pode sujar o JSX, e CSS modules dificultam a injeção dinâmica de propriedades.

### Decisão
Uso de **Styled Components** com um arquivo global de `theme.js` para ditar as cores padrão (paleta Charcoal e Wine). A renderização da Vercel entrega os estilos cacheados, garantindo compatibilidade e estilização escopada a componentes React.
