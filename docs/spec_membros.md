# Spec-Driven Development (SDD) — Módulo de Membros

Este documento detalha as especificações técnicas (Technical Specification) exatas para a implementação do Módulo de Membros, atuando como o contrato de desenvolvimento (blueprint) antes da codificação.

---

## 1. Estrutura do Banco de Dados (Prisma)

A implementação exigirá a adição do seguinte schema.

**Tabelas Afetadas**:
- `Member` (novo)
- `Ministry` (novo)
- `MemberMinistry` (novo)

**Estratégia de Integração**:
- Um novo arquivo `prisma/schema.prisma` modificado será gerado. 
- O campo `userId` no `Member` será mapeado como opcional (`String? @unique`), com constraint de `SetNull` no `onDelete` para preservar o cadastro se o operador logado for excluído.

---

## 2. Especificação da API Backend (Vercel Functions)

Caminho do diretório: `api/members/`

### 2.1. Função: Listar & Buscar Membros
- **Arquivo**: `api/members/index.js`
- **Método**: `GET`
- **Lógica Interna**:
  - Validação de JWT obrigatória (`getAuthenticatedUser(req)`).
  - Extração de `query.page`, `query.limit`, `query.search`, `query.status`.
  - **Prisma Query**:
    ```javascript
    prisma.member.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        AND: [
          status ? { status } : {},
          search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}
        ]
      },
      orderBy: { name: 'asc' }
    });
    ```
- **Retorno**: `{ data: [...], meta: { total, page, totalPages } }`

### 2.2. Função: Criar Membro
- **Arquivo**: `api/members/index.js` (bloco interno para `POST`)
- **Método**: `POST`
- **Lógica Interna**:
  - Validação rigorosa dos campos enviados (Nome obrigatório).
  - Normalização de dados (e-mail minúsculo, limpar máscara do CPF).
  - Proteção contra CPF duplicado (`prisma.member.findUnique({ where: { cpf } })`).
- **Retorno**: `201 Created` com objeto `Member` gerado.

### 2.3. Função: Editar / Excluir Membro
- **Arquivo**: `api/members/[id].js` (Vercel Dynamic Route)
- **Métodos**: `PUT` (update) / `DELETE` (soft delete mudando status para "DISMISSED").

---

## 3. Especificação do Frontend (React + Vite)

Caminho do diretório: `src/modules/members/`

### 3.1. Roteamento (`routes/MembersRoutes.jsx` e `AppRoutes.jsx`)
- Modificar o `AppRoutes.jsx` para importar a listagem de membros na rota `/membros`.

### 3.2. Gerenciamento de Estado (Hooks)
- **Arquivo**: `hooks/useMembers.js`
- **Implementação**: Custom hook encapsulando a chamada via Axios (`apiClient`), gerenciando estados de `loading`, `error` e `data` para listagem e paginação com debouncing de 500ms na busca textual.

### 3.3. Árvore de Componentes

1. `pages/MembersPage.jsx`
   - O contêiner pai. Orquestra o `useMembers`. Exibe o `PageHeader`.
2. `components/MembersTable.jsx`
   - Componente puro (`dumb component`). Recebe `members` via prop e renderiza a tabela estilizada (Styled Components). Trata exibição de estados vazios chamando `<EmptyState />`.
3. `components/MemberFormModal.jsx`
   - Modal ou Drawer lateral para cadastro e edição. Mantém estado de formulário isolado (sem sujar o estado da tela principal).
   - Utiliza `<TextField>` global para os inputs.
4. `components/StatusBadge.jsx`
   - Componente visual minúsculo que recebe uma string (`ACTIVE`, `INACTIVE`) e renderiza uma cápsula com a cor exata definida no `theme.js`.

---

## 4. Estratégia de Upload (Supabase Storage)

**Fluxo Técnico**:
1. O usuário seleciona a foto no `<input type="file">`.
2. O componente Frontend usa a API oficial `@supabase/supabase-js` instanciada localmente com a chave anônima (apenas permissão de inserção).
3. Faz o upload para o bucket `avatars` nomeando o arquivo como `uuid-do-membro.jpg`.
4. Obtém o link público (`getPublicUrl`).
5. Envia esse link na chamada `POST /api/members` no atributo `photoUrl`.

---

## 5. Casos Limite e Erros Previsíveis (Edge Cases)

- **Falha de Rede na Edição**: Se o request PUT falhar, a UI reverte otimisticamente para o estado original e emite notificação de erro.
- **Data Nascimento Inválida**: Input bloqueia anos superiores a hoje; API rejeita cast de DateTime inválido com erro HTTP 400 amigável ("Data de nascimento inválida").
