# PRD 003 — Módulo Infantil (Ministério de Crianças)

Este documento de Requisitos de Produto (PRD) detalha a especificação para a construção do **Módulo Infantil** do Proclamai 360, focado em alta velocidade de check-in rodando na infraestrutura serverless da Vercel.

---

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O **Módulo Infantil** foca no controle e segurança física de crianças no departamento da igreja (Check-in/Check-out).

**Restrições Arquiteturais:**
- **Alta Concorrência no Check-in**: Nos 10 minutos anteriores ao início do culto, vários voluntários podem estar usando o sistema em múltiplos tablets ao mesmo tempo realizando o check-in. O Supabase (PostgreSQL) com PgBouncer nativo garantirá a consistência paralela sem travar (deadlocks).
- **Latência Vercel**: As rotas de criação de `ChildCheckin` na Vercel API precisam ser enxutas. O algoritmo de geração de código de segurança (3 dígitos randômicos) deve rodar na própria função Node.js para responder em menos de 300ms, impedindo congestionamento na recepção da igreja.

---

## 2. Personas e Usuários

* **Líder/Voluntário**: Opera os tablets nas catracas do departamento, gerando rapidamente as etiquetas de entrada e verificando a saída.
* **Responsável**: Apresenta a identificação e retira o ticket.

---

## 3. Histórias de Usuário (User Stories)

| ID | Persona | Ação | Resultado | Critério de Aceite |
|---|---|---|---|---|
| **US-01** | Voluntário | Check-in de 1 segundo | Código randômico é gerado e salvo sem recarregar a tela | - Rota Vercel `POST /api/infantil/checkin` retorna imediatamente.<br>- Código randômico não colide com check-ins abertos. |
| **US-02** | Voluntário | Ver Alergias em Tempo Real | Risco nutricional mitigado | - Ao consultar lista ativa de checkins, o Prisma já faz `include` da relação infantil trazendo o campo texto de alergias. |
| **US-03** | Voluntário | Validar Saída (Check-out) | Criança é baixada e seu registro atualiza o tempo final | - Operação de edição na tabela via Prisma para atualizar `checkoutTime`. |

---

## 4. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **Painel de Check-in (Tablet-first)**: UI desenhada primariamente para toques grandes em dispositivos móveis conectados em rede Wi-Fi.
- **Relação de Tutela Segura**: O Supabase precisa garantir que apenas os responsáveis atrelados (tabela `child_guardians`) possuam autorização sistêmica listada.
- **Check-out Rápido**: Busca imediata baseada no código de 3 a 4 caracteres gerado, zerando o status do checkin de `open` para `closed`.

### P1 (Importante - Próxima Sprint)
- **Painel Ativo (Live Dashboard)**: Dashboard do infantil fazendo auto-refresh (`SWR` ou `React Query` na UI) com as métricas do Supabase atualizando a lotação das salas de berçário, maternal, etc.

---

## 5. Modelo de Dados (Supabase PostgreSQL via Prisma)

```prisma
model Child {
  id              String           @id @default(uuid())
  name            String
  birthDate       DateTime
  allergies       String?          @db.Text
  
  guardians       ChildGuardian[]
  checkins        ChildCheckin[]
  @@map("children")
}

model ChildCheckin {
  id           String    @id @default(uuid())
  securityCode String    // Código randômico
  checkinTime  DateTime  @default(now())
  checkoutTime DateTime?
  
  checkedInById  String
  checkedOutById String?
  childId        String
  guardianId     String    
  
  @@map("child_checkins")
}
```

---

## 6. Endpoints da API (Vercel Serverless Functions)

- `POST /api/infantil/checkin`: Recebe ID da criança e responsável. Gera UUID e um Random Security Code curto. Salva no Supabase via Prisma e retorna em formato JSON otimizado.
- `GET /api/infantil/live`: Retorna a query de `ChildCheckin` onde `checkoutTime` é nulo (presenças ativas atuais). Pode utilizar as estratégias de Edge Caching da Vercel com revalidação curta (SWR/Stale-While-Revalidate).
