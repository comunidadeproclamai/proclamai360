# PRD 005 — Módulo de Configurações e Dashboard Dinâmico

Este documento detalha o **Módulo de Configurações** (Administração do Sistema) e o **Dashboard Dinâmico**, arquitetados para extrair máxima performance da integração Vercel Serverless + Supabase.

---

# PARTE 1 — Módulo de Configurações

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O Módulo Administrativo gerencia perfis de usuários e logs de segurança.

**Restrições Arquiteturais:**
- **Autenticação Segura JWT (Vercel API)**: Toda modificação de sistema validará rigidamente o JWT gerado e processado pelo próprio backend (arquitetura stateless). As permissões lógicas (`role` guardada na tabela `User` do Supabase PostgreSQL) definirão o que cada chamada Vercel pode autorizar. Não delegaremos ao Supabase Auth/RLS nativo neste estágio para manter o controle absoluto dentro de nossa arquitetura customizada Prisma Node.
- **Carga de Auditoria**: Para não poluir requisições vitais, os inserts na tabela `AuditLog` deverão ser não-bloqueantes ou processados no fim da Vercel Function (pouco antes de retornar a resposta HTTP) usando a conexão PostgreSQL do Prisma em pool.

## 2. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **Roles & Permissões**: Perfis como `admin` ou `member` configurados internamente. A função helper da API Serverless (`requireRole`) barrará acessos a módulos proibidos via código `403 Forbidden`.
- **Logs de Auditoria Básica**: Registros salvos no banco PostgreSQL em tabelas separadas.

---

# PARTE 2 — Dashboard Dinâmico

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O Dashboard é a porta de entrada. Precisa carregar incrivelmente rápido e resumir as tabelas de Membros, Finanças, Crianças e Louvor em cards.

**Restrições Arquiteturais:**
- **Prevenção de Gargalos de CPU/Banco (Supabase)**: Exigir a leitura massiva de todas as linhas de todas as tabelas na renderização do painel explodirá a capacidade da Vercel Function e do Prisma. A rota da API do Dashboard utilizará agregações diretas via banco de dados (`prisma.member.count()`, `prisma.financialTransaction.aggregate(_sum: { amount })`) em vez de trazer todos os registros para a memória do servidor Vercel.
- **Cache Control (Vercel Edge)**: A Vercel Function de estatísticas do dashboard pode fazer uso do cabeçalho de cache (`SWR - Stale While Revalidate`) ou Edge Caching (`Cache-Control: public, s-maxage=30, stale-while-revalidate=59`), permitindo que a Vercel CDN responda diretamente na latência zero para dezenas de usuários se conectando simultaneamente no fim do culto sem tocar no banco Supabase.

## 2. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **KPIs Agregados Prisma**: Total de membros (count), saldo financeiro da igreja (soma). Retorno otimizado da API Vercel em payload leve.
- **UI Responsiva e Edge Ready**: Interface Styled Components recebendo JSON com as métricas quase instantaneamente.

## 3. Modelo de Dados (Supabase PostgreSQL via Prisma)

```prisma
model SystemConfig {
  id           String   @id @default(uuid())
  churchName   String
  logoUrl      String?  // Arquivo no Supabase Storage
  updatedAt    DateTime @updatedAt
  @@map("system_configs")
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String   
  details   String   @db.Text
  timestamp DateTime @default(now())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("audit_logs")
}
```

## 4. Endpoints da API (Vercel Serverless Functions)

- `GET /api/dashboard/stats`: A rota crítica. Internamente, executa Múltiplas Promises concorrentes do Prisma para extrair as métricas de Member, ChildCheckin e FinancialTransaction e junta no objeto final de resposta. O uso do Supabase Connection Pooler é obrigatório aqui devido ao disparo paralelo.
