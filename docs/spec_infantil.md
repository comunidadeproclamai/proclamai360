# Spec-Driven Development (SDD) — Módulo Infantil

Este documento detalha as especificações técnicas (Technical Specification) exatas para a implementação do Módulo Infantil, assegurando a infraestrutura de código em alta concorrência.

---

## 1. Estrutura do Banco de Dados (Prisma)

A implementação exigirá a adição do seguinte schema.

**Tabelas Afetadas**:
- `Child` (cadastro puro com text-field para necessidades especiais)
- `ChildGuardian` (tabela de resolução Muitos-Para-Muitos)
- `ChildCheckin` (eventos temporais voláteis)

**Decisões Técnicas de Banco**:
- Relação **Cascade** (`onDelete: Cascade`) implementada em `ChildGuardian`. Se um responsável for apagado fisicamente, a relação é desfeita. Se a criança for apagada, todas as associações somem sem gerar registros órfãos.
- O campo `securityCode` não será único a nível de tabela global, mas será único a nível do *dia/culto atual*, o que significa que precisamos gerenciá-lo por código na camada da Vercel.

---

## 2. Especificação da API Backend (Vercel Functions)

Caminho do diretório: `api/infantil/`

### 2.1. Função: Check-in (Alta Prioridade)
- **Arquivo**: `api/infantil/checkin.js`
- **Método**: `POST`
- **Lógica Interna (Segurança & Colisão)**:
  - O código de segurança será uma string numérica de 3 a 4 dígitos ou combinação alfanumérica curta (ex: "B-492").
  - Geração baseada em Math.random.
  - Para evitar colisões (dois check-ins tirando o mesmo número no mesmo segundo):
    - A API gera o número, tenta inserir no Prisma no campo `securityCode` e lida com verificação prévia no banco, mas como as salas só têm ~50 crianças por evento, o risco de colisão (hash entropy de 3 dígitos numéricos = 1/1000) é suportável com um loop simples de retentativa de 2 vezes no código da API.
- **Retorno**: `201 Created` retornando o `securityCode` formatado para o tablet exibir.

### 2.2. Função: Check-out
- **Arquivo**: `api/infantil/checkout.js`
- **Método**: `POST`
- **Lógica Interna**:
  - Busca um registro de `ChildCheckin` pelo seu `id` e atualiza `checkoutTime` para `new Date()` e insere em `checkedOutById` o ID do usuário (Voluntário) do Token JWT validado no header.

### 2.3. Função: Live Dashboard (Live Feed)
- **Arquivo**: `api/infantil/live.js`
- **Método**: `GET`
- **Lógica Interna**:
  - Busca as crianças atualmente no ambiente:
    ```javascript
    prisma.childCheckin.findMany({
      where: { checkoutTime: null },
      include: { child: true, guardian: true }
    });
    ```

---

## 3. Especificação do Frontend (React + Vite)

Caminho do diretório: `src/modules/infantil/`

### 3.1. Gerenciamento de Estado de Tempo Real (Hooks)
- **Arquivo**: `hooks/useInfantilLive.js`
- Este hook será fundamentalmente diferente. Usaremos um *Polling* nativo via `setInterval` ou React Query (ex: `refetchInterval: 3000`) para consultar a rota `GET /api/infantil/live` a cada 3 a 5 segundos no tablet da recepção. Sendo uma chamada leve no banco indexado, a Vercel/Supabase suportam facilmente essa carga.

### 3.2. Árvore de Componentes

1. `pages/InfantilPage.jsx`
   - Dashboard em formato de abas ("Check-in", "Salas Ativas").
2. `components/LiveClassroomGrid.jsx`
   - Mapeia os dados recebidos pelo `useInfantilLive` em cards.
   - Aplica lógica de agrupamento no lado do cliente: Agrupa as crianças por faixa etária calculada dinamicamente via função auxiliar `calculateAge(birthDate)` antes da renderização em React.
3. `components/KidAvatar.jsx`
   - Se não houver foto da criança, gera as duas iniciais coloridas (ex: "PS"). Se a criança possuir a propriedade `allergies !== null`, injeta no avatar um badge flutuante em vermelho com um símbolo de alerta (ícone `AlertTriangle` do Lucide-react).

---

## 4. Casos Limite e Erros Previsíveis (Edge Cases)

- **Double Check-in**: A API deve consultar se a criança fornecida já tem um registro em `ChildCheckin` com `checkoutTime === null` no mesmo dia. Se sim, rejeita com HTTP 409 Conflict ("Criança já está registrada no momento").
- **Esquecimento de Check-out**: Crianças que deram entrada de manhã e o voluntário esqueceu de fazer check-out. A query de dashboard vivo (`live.js`) deve ser limitada às últimas 12 horas para não exibir fantasmas no culto da noite.
