# PRD 004 — Módulo de Louvor (Ministério de Música)

Este documento de Requisitos de Produto (PRD) detalha a especificação para a construção do **Módulo de Louvor** do Proclamai 360, moldado na infraestrutura Vercel + Supabase.

---

## 1. Visão Geral e Arquitetura (Vercel + Supabase)

O **Módulo de Louvor** lida com agendamentos de escalas, controle de disponibilidade de voluntários e banco de cifras musicais.

**Restrições Arquiteturais:**
- **Repertório e Mídia Externa**: O Supabase PostgreSQL armazenará apenas os **Metadados** das canções (título, BPM, tom). Cifras ricas e áudios pesados devem ser geridos via links externos (YouTube, Spotify, Cifra Club) gravados em colunas tipo String no BD, em vez de carregar arquivos para a nuvem da Vercel, mantendo os custos de largura de banda nulos.
- **Design de Relacionamentos Complexos**: Escalas de louvor demandam alta normalização no banco. O Prisma fará as inserções de múltiplas tabelas aninhadas (`WorshipScale`, `WorshipLineup`, `SongInSetlist`) de uma só vez utilizando as inserções de relacionamentos aninhados `create: { lineup: { create: [...] } }`, minimizando a duração de execução da Vercel Function.

---

## 2. Personas e Usuários

* **Líder de Louvor**: Monta as bandas, escolhe as setlists e envia as escalas.
* **Músico/Cantor**: Confirma participação, visualiza repertório.

---

## 3. Histórias de Usuário (User Stories)

| ID | Persona | Ação | Resultado | Critério de Aceite |
|---|---|---|---|---|
| **US-01** | Músico | Acessar pelo celular a escala do domingo | Puxar os dados em rede lenta em menos de 1 seg | - Otimização de dados: A API da Vercel seleciona no Prisma apenas os campos estritamente úteis (evitar fetch total de relações). |
| **US-02** | Líder | Criar Escala do Culto com músicos e repertório | Estrutura de dados relacional (SQL) complexa é gerada limpa | - Uso das transações aninhadas do Prisma para vincular na tabela M:N de músicos e repertório. |

---

## 4. Requisitos Funcionais

### P0 (Crítico - Essencial para Lançamento)
- **Biblioteca de Canções**: Cadastro via Prisma com CRUD completo de `Song`.
- **Montagem de Escala**: Interface interativa que dispara POST para salvar na `WorshipScale`.
- **Confirmação/Recusa**: O músico aperta um botão na UI que dispara um PUT atualizando seu status na tabela relacional de line-up.

### P1 (Importante - Próxima Sprint)
- **Gerenciador de Habilidades**: Relacionar o `MemberId` do Supabase a um instrumento cadastrado via Prisma (`MusicianSkill`), impedindo que membros inaptos apareçam no select de bateria, por exemplo.

---

## 5. Modelo de Dados (Supabase PostgreSQL via Prisma)

```prisma
model Song {
  id          String         @id @default(uuid())
  title       String
  artist      String
  defaultKey  String         
  bpm         Int?
  chordsUrl   String?        // Apenas URL externa, sem upload pesado
  videoUrl    String?        // Apenas URL externa, sem upload pesado

  setlists    SongInSetlist[]
  @@map("songs")
}

model WorshipScale {
  id          String             @id @default(uuid())
  date        DateTime
  eventName   String             
  
  lineup      WorshipLineup[]
  setlist     SongInSetlist[]
  @@map("worship_scales")
}

model WorshipLineup {
  scaleId    String
  memberId   String
  instrument String            
  status     String            @default("PENDING") 

  scale      WorshipScale      @relation(fields: [scaleId], references: [id], onDelete: Cascade)
  member     Member            @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@id([scaleId, memberId, instrument])
  @@map("worship_lineups")
}
```

---

## 6. Endpoints da API (Vercel Serverless Functions)

- `GET /api/louvor/scales`: Rota leve. Retorna a escala do mês atual filtrando as datas no lado do banco (`where: { date: { gte: startOfMonth } }`).
- `POST /api/louvor/scales`: Rota robusta. O payload JSON contém o array de membros e o array de músicas. O Prisma executa o salvamento atômico de todo o bloco.
