import styled from 'styled-components';
import { Trash2, Edit2, User } from 'lucide-react';
import { DataTable } from '../../../components/common/DataTable';
import { Badge } from '../../../components/common/Badge';

const AvatarFallback = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gold};
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
`;

const AvatarImage = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(197, 165, 92, 0.3);
`;

const NameCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const NameText = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
`;

const EmailText = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 400;
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

export function MembersTable({ members, isLoading, onDelete, onEdit, canManage = false }) {
  const columns = [
    {
      key: 'name',
      label: 'Membro',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {row.photoUrl ? (
            <AvatarImage src={row.photoUrl} alt={val} />
          ) : (
            <AvatarFallback><User size={18} /></AvatarFallback>
          )}
          <NameCol>
            <NameText>{val}</NameText>
            <EmailText>{row.email}</EmailText>
          </NameCol>
        </div>
      ),
    },
    { key: 'phone', label: 'Telefone' },
    { key: 'congregation', label: 'Congregação' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const variant = val === 'ACTIVE' ? 'success' : val === 'VISITOR' ? 'warning' : 'neutral';
        const label = val === 'ACTIVE' ? 'ATIVO' : val === 'VISITOR' ? 'VISITANTE' : 'INATIVO';
        return <Badge variant={variant}>{label}</Badge>;
      },
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
      data={members} 
      columns={columns} 
      isLoading={isLoading} 
      emptyMessage="Nenhum membro encontrado." 
    />
  );
}
