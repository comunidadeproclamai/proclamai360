# Spec-Driven Development (SDD) — Módulo Financeiro

Este documento detalha as especificações técnicas (Technical Specification) exatas para a implementação do Módulo Financeiro, atuando como o contrato de desenvolvimento (blueprint).

---

## 1. Estrutura do Banco de Dados (Prisma)

A implementação exigirá a adição do seguinte schema.

**Tabelas Afetadas**:
- `FinancialAccount` (contas com salto acumulado decimal)
- `FinancialCategory` (categorias parametrizadas)
- `FinancialTransaction` (lançamentos)

**Decisões Técnicas de Banco**:
- Os valores monetários (`amount` e `balance`) devem ser mapeados utilizando `@db.Decimal(12, 2)` no PostgreSQL para evitar erros de precisão flutuante comuns do JavaScript ao lidar com floats puros.
- A exclusão de contas bancárias só será permitida (na camada de API) se a conta tiver zero transações associadas. Caso contrário, deve ser implementado um "arquivamento" (`isArchived`).

---

## 2. Especificação da API Backend (Vercel Functions)

Caminho do diretório: `api/financial/`

### 2.1. Função: Criar Transação & Atualizar Saldo (Atômico)
- **Arquivo**: `api/financial/transactions.js`
- **Método**: `POST`
- **Lógica Interna (O Core do Módulo)**:
  - Validar payload (`amount > 0`).
  - O cálculo de ajuste do saldo depende se é `INFLOW` ou `OUTFLOW`.
  - **Prisma Transaction (CRÍTICO)**:
    ```javascript
    const isOutflow = type === 'OUTFLOW';
    const amountModifier = isOutflow ? { decrement: amount } : { increment: amount };

    await prisma.$transaction([
      // 1. Criar transação registrando o usuário criador
      prisma.financialTransaction.create({ data: { ... } }),
      // 2. Ajustar conta vinculada atomicamente
      prisma.financialAccount.update({
        where: { id: accountId },
        data: { balance: amountModifier }
      })
    ]);
    ```
- **Retorno**: `201 Created`

### 2.2. Função: Excluir Transação (Rollback de Saldo)
- **Arquivo**: `api/financial/transactions/[id].js`
- **Método**: `DELETE`
- **Lógica Interna**:
  - Ler a transação antes de excluir para saber o valor original e o tipo.
  - Se era `INFLOW`, debitar o valor da conta. Se era `OUTFLOW`, creditar o valor na conta.
  - Executar novamente como `prisma.$transaction`.

### 2.3. Função: Agregações (Dashboard Financeiro)
- **Arquivo**: `api/financial/summary.js`
- **Método**: `GET`
- **Lógica Interna**: Utilizar `prisma.financialTransaction.aggregate()` limitando a query de datas para o primeiro dia até o último dia do mês corrente. Retorna `totalInflows` e `totalOutflows`.

---

## 3. Especificação do Frontend (React + Vite)

Caminho do diretório: `src/modules/financeiro/`

### 3.1. Gerenciamento de Estado (Hooks)
- **Arquivo**: `hooks/useFinancial.js`
- Responsável por 3 frentes: carregar contas, carregar categorias e carregar o histórico paginado de transações.

### 3.2. Árvore de Componentes

1. `pages/FinanceiroPage.jsx`
   - Concentra o painel com saldo total.
   - Gerencia a abertura dos modais de nova receita e nova despesa.
2. `components/TransactionModal.jsx`
   - Opcionalmente unifica as lógicas ou é dividido em `InflowModal` e `OutflowModal` para simplificar validações.
   - Ao salvar, este componente chama o service, e logo após sucesso, dispara um trigger para o `useFinancial.js` recarregar o dashboard sem refresh de tela.
3. `components/BalanceCards.jsx`
   - Usa `<StatCard>` (do design system comum) passando o valor convertido com a função formatadora `formatCurrency(amount)`.
4. `components/ReceiptUploader.jsx`
   - Dropzone esteticamente inserido que sobe PDFs/Imagens pro Supabase e aciona uma flag visual de "Anexo carregado".

---

## 4. Utilitários (Helpers)

Será criado o arquivo `src/utils/currency.js` no repositório global do frontend:
```javascript
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
```

---

## 5. Casos Limite e Erros Previsíveis (Edge Cases)

- **Conta com Saldo Insuficiente**: Na rota da API, se após a transação o saldo da conta for detectado como negativo, a API não impede nativamente, mas lança um aviso no array de resposta `warnings: ['Saldo da conta ficou negativo']`.
- **Validação de Data**: Impedir o lançamento de transações em datas futuras (além de 1 dia de margem).
