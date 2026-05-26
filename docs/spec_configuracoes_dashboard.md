# Spec-Driven Development (SDD) — Módulo de Configurações e Dashboard

Este documento detalha as especificações técnicas (Technical Specification) da espinha dorsal operacional, combinando Administração Geral e a Inteligência Operacional do Dashboard.

---

## 1. Estrutura do Banco de Dados (Prisma)

A implementação exigirá a adição do seguinte schema.

**Tabelas Afetadas**:
- `SystemConfig` (Registro único institucional)
- `AuditLog` (Tabela append-only pesada e infinita)
- Atualização semântica do enum no front-end para o atributo existente `role` da tabela `User`.

**Decisões Técnicas de Banco**:
- Os `AuditLogs` gerarão alto volume rapidamente. Não haverá índices pesados para não comprometer inserções. Essa tabela destina-se a buscas eventuais, não frequentes, priorizando a velocidade de gravação (append-only) do Prisma no Supabase.

---

## 2. Especificação da API Backend (Vercel Functions)

### 2.1. Middleware Lógico de Segurança (Backend JWT)
- **Arquivo Global**: `api/shared/auth.js`
- Vamos adicionar um helper `requireRole(req, res, allowedRoles)`.
- Se a role extraída do JWT não estiver no array, o helper finaliza o pipeline retornando status 403 Forbidden com JSON `{ error: 'Acesso negado para o seu nível hierárquico' }`.

### 2.2. Função: Logs de Auditoria Global Helper
- **Arquivo Global**: `api/shared/audit.js`
- Exporta função `logActivity(prismaClient, userId, action, details)`. Onde o sistema rodar operações deletáveis (ex: apagar dízimo, apagar membro), a rota Vercel chamará esta função assincronamente (sempre usando o Prisma Client existente para não esgotar as conexões do PgBouncer).

### 2.3. Função: Compilação de Estatísticas do Dashboard (Core KPI)
- **Arquivo**: `api/dashboard/stats.js`
- **Método**: `GET`
- **Lógica Interna (Performance Crítica)**:
  - Usar `Promise.all` disparando as queries pesadas em paralelo usando as instâncias gerenciadas do prisma.
    ```javascript
    const [totalMembers, financialAgg, checkinsToday] = await Promise.all([
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.financialTransaction.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true }
      }),
      prisma.childCheckin.count({
        where: { checkinTime: { gte: startOfDay }, checkoutTime: null }
      })
    ]);
    ```
  - Esta rota configurará o response de cache para alívio: `res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')`. Isso quer dizer que se 5 secretários abrirem a Home em menos de 10 segundos, o PostgreSQL só processará as métricas pesadas uma única vez, respondendo pela CDN Edge nos outros casos.

---

## 3. Especificação do Frontend (React + Vite)

### 3.1. Roteamento Lógico de Permissões
- O componente `ProtectedRoute.jsx` será modificado para aceitar uma `role` requerida (ex: `<ProtectedRoute allowedRoles={['admin', 'tesoureiro']} />`). Bloqueia o tráfego do React Router antes mesmo da chamada falhar na Vercel API.

### 3.2. Árvore de Componentes (Configurações)
- Caminho: `src/modules/configuracoes/`
- Componentes focados em abas administrativas usando o estado do React. Uma aba salva a modelagem em `SystemConfig`, e outra aba carrega um table com paginação de `AuditLog` ordenado do mais novo pro mais velho.

### 3.3. Árvore de Componentes (Dashboard)
- O Dashboard já existe (`src/modules/dashboard/pages/DashboardPage.jsx`). O refactoring trocará as métricas marretadas para utilizar o hook customizado `useDashboardStats()`.
- O `<StatCard>` componente receberá os dados em tempo real. Uma renderização com skeletons CSS (`<div className="animate-pulse">`) protegerá o visual premium enquanto as promessas do SWR carregam as informações estatísticas reais da Vercel.

---

## 4. Casos Limite e Erros Previsíveis (Edge Cases)

- **Falta do `SystemConfig`**: Se a API `GET /api/system/config` for chamada pela primeira vez numa instalação crua, o Prisma retornará nulo ou array vazio. A API da Vercel deve tratar com um *fallback/upsert* seguro ou o frontend lidará com objeto vazio (`{}`).
- **Falha Parcial no Dashboard**: A Vercel API do Dashboard agrupa queries de vários domínios. Se um domínio falhar misteriosamente, envolver as queries individuais do `Promise.all` com um catch tolerante pode ser necessário para que um erro no infantil não derrube a exibição do saldo financeiro.
