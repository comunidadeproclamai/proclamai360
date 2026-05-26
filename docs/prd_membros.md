# PRD 001 — Módulo de Membros (Gestão de Pessoas)

Este documento de Requisitos de Produto (PRD) detalha a especificação para a construção do **Módulo de Membros** do Proclamai 360, arquitetado para rodar nativamente na Vercel com banco Supabase.

---

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O **Módulo de Membros** é a espinha dorsal operacional do Proclamai 360. Seu propósito é permitir o cadastro centralizado de membros para facilitar o cuidado pastoral.

**Restrições Arquiteturais:**
- **Backend (Vercel Functions)**: Todas as APIs de membros (`/api/members`) rodarão como funções Serverless (stateless) na Vercel. Devem ser leves para minimizar *cold starts*.
- **Banco de Dados (Supabase PostgreSQL)**: O acesso aos dados usa o Prisma via Connection Pooler (PgBouncer) para suportar picos de acessos de voluntários atualizando cadastros aos finais de semana.
- **Armazenamento (Supabase Storage)**: O Vercel File System é efêmero (somente-leitura). Logo, todas as fotos de perfil capturadas no cadastro serão enviadas diretamente do navegador do usuário para o **Supabase Storage** (via APIs do cliente Supabase), armazenando apenas a URL final (string) na tabela do banco PostgreSQL.

---

## 2. Personas e Usuários

* **Pastor / Líder Ministerial**: Acompanha o crescimento espiritual, aniversários e visitas pastorais.
* **Secretário(a) da Igreja (Administrador)**: Realiza novos cadastros, insere informações eclesiásticas oficiais e exporta relatórios.

---

## 3. Histórias de Usuário (User Stories)

| ID | Persona | Ação | Resultado | Critério de Aceite |
|---|---|---|---|---|
| **US-01** | Secretário | Cadastrar uma nova pessoa | Inserção rápida de dados no Supabase PostgreSQL | - O upload da foto deve ser salvo no Supabase Storage (bucket `members_photos`).<br>- Validação de CPF único via Prisma. |
| **US-02** | Pastor | Filtrar membros | Busca rápida para visitas pastorais | - A requisição `GET /api/members` deve suportar query params eficientes. |
| **US-03** | Secretário | Exportar dados em CSV | Obter um relatório compatível com Excel | - A Vercel Function deve processar e devolver um stream ou string CSV de tamanho leve (abaixo do limite de 4.5MB da Vercel API). |

---

## 4. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **Cadastro Completo**: Formulário com campos Pessoais e Eclesiásticos.
- **Listagem e Busca**: Tabela paginada via Prisma `take` e `skip`. Busca textual eficiente.
- **Filtro de Status**: Ativo, Inativo, Visitante, Transferido e Desligado.

### P1 (Importante - Próxima Sprint)
- **Upload de Foto de Perfil**: Integração nativa do frontend React com o Supabase Storage SDK.
- **Aniversariantes do Mês**: Consulta Prisma agrupada por dia e mês.

---

## 5. Modelo de Dados (Supabase PostgreSQL via Prisma)

```prisma
model Member {
  id               String    @id @default(uuid())
  name             String
  email            String?   @unique
  cpf              String?   @unique
  birthDate        DateTime?
  photoUrl         String?   // URL retornada pelo Supabase Storage
  
  // Status Eclesiásticos
  status           String    @default("ACTIVE") // ACTIVE, INACTIVE, VISITOR, DISMISSED
  congregation     String?
  notes            String?   @db.Text
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relações DB
  userId           String?   @unique
  user             User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  memberMinistries MemberMinistry[]

  @@map("members")
}
```

---

## 6. Endpoints da API (Vercel Serverless Functions)

Os endpoints residirão em `/api/members/index.js` (ou rotas nomeadas). Para alta performance, usaremos transações apenas quando estritamente necessário.

- `GET /api/members`: Busca lista (com suporte a cache `Cache-Control: s-maxage=60` na Vercel Edge se não for dado ultrassensível).
- `POST /api/members`: Salva no Supabase DB os campos do membro. O upload da imagem ocorre *antes* dessa chamada (no frontend) ou por pre-signed URL.
- `PUT /api/members/:id`: Atualização atômica usando `prisma.member.update`.
- `DELETE /api/members/:id`: Soft delete.
