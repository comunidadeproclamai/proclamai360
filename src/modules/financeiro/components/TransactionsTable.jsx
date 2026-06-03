import styled from 'styled-components';
import { Trash2, Edit2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { DataTable } from '../../../components/common/DataTable.jsx';
import { Badge } from '../../../components/common/Badge.jsx';
import { formatCurrency } from '../../../utils/currency.js';

const IconCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ${({ $type }) => ($type === 'INFLOW' ? 'rgba(60,168,118,0.08)' : 'rgba(223,83,83,0.08)')};
  color: ${({ $type, theme }) => ($type === 'INFLOW' ? theme.colors.success : theme.colors.danger)};
`;

const InfoBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
`;

const Description = styled.strong`
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
`;

const Meta = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.82rem;
  margin-top: 0.2rem;
`;

const Amount = styled.span`
  color: ${({ $type, theme }) => ($type === 'INFLOW' ? theme.colors.success : theme.colors.ice)};
  font-size: 1.05rem;
  font-weight: 800;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.muted};
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ title, theme }) => title === 'Excluir' ? theme.colors.danger : theme.colors.gold};
    border-color: ${({ title, theme }) => title === 'Excluir' ? 'rgba(223, 83, 83, 0.2)' : 'rgba(197, 165, 92, 0.15)'};
    transform: scale(1.05);
  }
`;

const FlexRow = styled.div`
  display: flex;
  gap: 0.6rem;
`;

export function TransactionsTable({ transactions, isLoading, onDelete, onEdit, canManage = false }) {
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const columns = [
    {
      key: 'description',
      label: 'Descrição',
      render: (val, row) => (
        <InfoBlock>
          <IconCircle $type={row.type}>
            {row.type === 'INFLOW' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
          </IconCircle>
          <Details>
            <Description>{val}</Description>
            <Meta>{formatDate(row.date)}</Meta>
          </Details>
        </InfoBlock>
      ),
    },
    { key: 'category', label: 'Categoria' },
    { key: 'account', label: 'Conta' },
    {
      key: 'type',
      label: 'Tipo',
      render: (val) => {
        const variant = val === 'INFLOW' ? 'success' : 'danger';
        const label = val === 'INFLOW' ? 'RECEITA' : 'DESPESA';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'amount',
      label: 'Valor',
      render: (val, row) => (
        <Amount $type={row.type}>
          {row.type === 'INFLOW' ? '+' : '-'} {formatCurrency(val)}
        </Amount>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        canManage ? (
          <FlexRow>
            <ActionButton title="Editar" onClick={() => onEdit(row)}><Edit2 size={16} /></ActionButton>
            <ActionButton title="Excluir" onClick={() => onDelete(row.id)}><Trash2 size={16} /></ActionButton>
          </FlexRow>
        ) : null
      ),
    },
  ];

  return (
    <DataTable 
      data={transactions} 
      columns={columns} 
      isLoading={isLoading} 
      emptyMessage="Nenhuma movimentação encontrada." 
    />
  );
}
