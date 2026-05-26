# PRD 002 — Módulo Financeiro

Este documento de Requisitos de Produto (PRD) detalha a especificação para a construção do **Módulo Financeiro** do Proclamai 360, focado em alta integridade de transações dentro da infraestrutura Vercel/Supabase.

---

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O **Módulo Financeiro** gerencia o fluxo de caixa, dízimos, ofertas e despesas da congregação. Por lidar com finanças, exige alta integridade transacional.

**Restrições Arquiteturais:**
- **Transações Seguras em Serverless**: Diferente de servidores contínuos, as Vercel Functions podem sofrer timeouts ou ser interrompidas. Portanto, as atualizações de saldo e registros de transação financeira DEVEM usar as `$transaction` do Prisma para garantir a regra ACID no banco Supabase PostgreSQL.
- **Comprovantes Fiscais (Anexos)**: O armazenamento de recibos (PDFs, JPEGs) utilizará o **Supabase Storage** (bucket restrito `financial_receipts`). O arquivo não deve passar pelo corpo da requisição da API na Vercel devido ao limite de 4.5MB da Vercel Functions payload limit; o frontend fará o envio direto para o Supabase e enviará apenas o caminho do arquivo para o backend.

---

## 2. Personas e Usuários

* **Tesoureiro / Administrador Financeiro**: Insere transações, anexa comprovantes, categoriza, e gera balanços.
* **Conselho de Liderança**: Audita registros de saídas e entradas e aprova despesas.

---

## 3. Histórias de Usuário (User Stories)

| ID | Persona | Ação | Resultado | Critério de Aceite |
|---|---|---|---|---|
| **US-01** | Tesoureiro | Registrar Dízimo/Oferta | Gravação garantida de transação e atualização do saldo no Supabase | - Uso de `prisma.$transaction`. |
| **US-02** | Tesoureiro | Anexar Recibo de Compra | O recibo fica guardado de forma durável para auditoria | - Upload direto do browser via Supabase JS Client.<br>- Registro da `attachment_url` no BD. |
| **US-03** | Líder | Ver fluxo de caixa (Dashboard) | Requisição rápida agregando valores | - A Vercel Function faz query agrupada `groupBy` no PostgreSQL via Prisma para otimizar transferência. |

---

## 4. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **Lançamentos (Entrada/Saída)**: Transações com tipo, valor absoluto, data e classificação.
- **Ajuste de Saldo Automático**: Ao inserir ou apagar transações, o saldo da `FinancialAccount` vinculada é corrigido via query atômica.
- **Categorias e Contas**: Tabelas de apoio (ex: "Caixa Geral", "Bradesco" / "Dízimos", "Luz").
- **Auditoria de Autor (Vínculo)**: Registro inalterável de quem realizou a operação (`User.id` extraído do JWT).

### P1 (Importante - Próxima Sprint)
- **Upload de Comprovantes**: Integração Supabase Storage para armazenamento de evidências.
- **Exportação de Relatório (PDF/CSV)**: Geração leve otimizada para o runtime edge da Vercel.

---

## 5. Modelo de Dados (Supabase PostgreSQL via Prisma)

```prisma
model FinancialAccount {
  id          String             @id @default(uuid())
  name        String             
  type        String             // BANK_ACCOUNT, CASH
  balance     Decimal            @default(0.00) @db.Decimal(12, 2)
  transactions FinancialTransaction[]
  @@map("financial_accounts")
}

model FinancialTransaction {
  id          String             @id @default(uuid())
  description String
  amount      Decimal            @db.Decimal(12, 2)
  date        DateTime
  type        String             // INFLOW, OUTFLOW
  attachment  String?            // Rota interna do Supabase Storage
  
  // Auditoria segura
  createdById String
  createdBy   User               @relation(fields: [createdById], references: [id])
  
  // Vínculos FK
  accountId   String
  account     FinancialAccount   @relation(fields: [accountId], references: [id])
  categoryId  String

  @@map("financial_transactions")
}
```

---

## 6. Endpoints da API (Vercel Serverless Functions)

- `POST /api/financial/transactions`: O backend recebe os dados, valida, e usa Prisma Transaction: (1) Insere registro de movimentação, (2) Atualiza o campo de saldo em `financial_accounts` correspondente (+ ou -).
- `GET /api/financial/summary`: Query otimizada pelo PostgreSQL para retornar apenas a soma agregada, evitando enviar os arrays gigantes de JSON pela Vercel Network (economia de banda).
