# Spec-Driven Development (SDD) — Módulo de Louvor

Este documento detalha as especificações técnicas (Technical Specification) exatas para a implementação do Módulo de Louvor, garantindo alta coesão e manipulação pesada de dados relacionais.

---

## 1. Estrutura do Banco de Dados (Prisma)

A implementação exigirá a adição do seguinte schema.

**Tabelas Afetadas**:
- `Song` (catálogo base isolado)
- `MusicianSkill` (habilidades por membro)
- `WorshipScale` (evento principal - agregado)
- `WorshipLineup` e `SongInSetlist` (linhas conectoras dependentes)

**Decisões Técnicas de Banco**:
- Excluir uma `WorshipScale` deletará em cascata todo o lineup e setlist (lixo não acumulado).
- A tabela de músicas (`Song`) permanece intocada pelas cascatas, protegendo o repertório geral da igreja.

---

## 2. Especificação da API Backend (Vercel Functions)

Caminho do diretório: `api/louvor/`

### 2.1. Função: Gerenciamento do Catálogo de Músicas
- **Arquivo**: `api/louvor/songs.js`
- Rotas REST padronizadas (GET, POST, PUT, DELETE) permitindo filtragem textual.

### 2.2. Função: Criação Agregada da Escala (Core)
- **Arquivo**: `api/louvor/scales.js`
- **Método**: `POST`
- **Lógica Interna (Design Patterns)**:
  - O JSON enviado pelo React vai prever a estrutura completa.
  - A magia de desempenho ocorre enviando uma única consulta aninhada para o Supabase, poupando a Vercel de fazer 10 `inserts` e esgotar o timeout:
    ```javascript
    prisma.worshipScale.create({
      data: {
        date: new Date(payload.date),
        eventName: payload.eventName,
        lineup: {
          create: payload.lineup.map(item => ({
            memberId: item.memberId,
            instrument: item.instrument,
            status: 'PENDING'
          }))
        },
        setlist: {
          create: payload.songs.map(song => ({
            songId: song.songId,
            order: song.order,
            customKey: song.customKey
          }))
        }
      }
    });
    ```

### 2.3. Função: Endpoint do Músico (Aprovação)
- **Arquivo**: `api/louvor/scales/[id]/confirm.js`
- **Método**: `PUT`
- **Lógica Interna**: A API lê o UUID do JWT, busca a linha em `WorshipLineup` onde `memberId` bate com o usuário logado e altera o `status` para `CONFIRMED` ou `DECLINED`. Evita que um membro aprove por outro.

---

## 3. Especificação do Frontend (React + Vite)

Caminho do diretório: `src/modules/louvor/`

### 3.1. Gerenciamento de Estado (Hooks)
- O hook `useWorshipScales.js` puxará a escala já expandida (include `lineup.member`, `setlist.song`) para facilitar a renderização.
- O hook `useSongs.js` alimentará uma lista estática cacheada para seleção rápida nas aberturas de modal sem bater na API.

### 3.2. Árvore de Componentes

1. `pages/LouvorPage.jsx`
   - Container principal com sistema de duas abas: "Agenda de Escalas" e "Repertório".
2. `components/ScaleBuilderModal.jsx`
   - Interface complexa (Form builder). Requer manutenção de estado local intenso (`useState` com Arrays/Objetos complexos) para ir preenchendo a vaga de cada instrumento (dropdown chamando a lista de membros filtrada por skills) e a setlist (sistema de busca em tempo real com botão `+ Add`) antes de enviar o Payload gigantesco pro backend.
3. `components/ScaleCard.jsx`
   - O item visual de um culto na página principal. Mapeia o array interno de `lineup` e renderiza mini ícones de "Check verde" (Confirmado) ou "Relógio amarelo" (Pendente) ao lado do nome de cada voluntário.
4. `components/SongPlayerLink.jsx`
   - Renderização condicional. Se `chordsUrl` estiver preenchido, renderiza `<a href>` com ícone do Cifra Club. Se `videoUrl`, ícone Play do YouTube, abrindo em nova guia nativa do navegador para o celular.

---

## 4. Casos Limite e Erros Previsíveis (Edge Cases)

- **Membro sem Instrumento**: Ao selecionar o Lineup da escala, a API só rejeita membros inexistentes. Contudo, o frontend é o encarregado lógico de mostrar a restrição na dropdown, não sugerindo pessoas para a "Bateria" se seu "MusicianSkill" não constar.
- **Transação Gigante**: Se houverem muitos elementos, o JSON Payload do POST não irá romper o limite da Vercel (limite é 4.5MB e o payload de uma escala com 10 músicas e 15 cantores pesa apenas 4 KB).
