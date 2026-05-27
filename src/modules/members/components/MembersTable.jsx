import styled from 'styled-components';
import { Trash2, Edit2, User } from 'lucide-react';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadow};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1.15rem 1.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gold};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const Td = styled.td`
  padding: 1.15rem 1.25rem;
  font-size: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.ice};
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

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

const Badge = styled.span`
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  
  background: ${({ $status, theme }) => 
    $status === 'ACTIVE' ? 'rgba(60, 168, 118, 0.08)' :
    $status === 'VISITOR' ? 'rgba(212, 162, 63, 0.08)' :
    'rgba(255, 255, 255, 0.05)'
  };
  color: ${({ $status, theme }) => 
    $status === 'ACTIVE' ? theme.colors.success :
    $status === 'VISITOR' ? theme.colors.warning :
    theme.colors.muted
  };
  border: 1px solid ${({ $status, theme }) => 
    $status === 'ACTIVE' ? 'rgba(60, 168, 118, 0.2)' :
    $status === 'VISITOR' ? 'rgba(212, 162, 63, 0.2)' :
    'rgba(255, 255, 255, 0.1)'
  };
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

const EmptyState = styled.div`
  padding: 4rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
  font-weight: 400;
`;

export function MembersTable({ members, isLoading, onDelete, canManage = false }) {
  if (isLoading) {
    return <TableContainer><EmptyState>Carregando membros...</EmptyState></TableContainer>;
  }

  if (!members || members.length === 0) {
    return <TableContainer><EmptyState>Nenhum membro encontrado.</EmptyState></TableContainer>;
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>Membro</Th>
            <Th>Telefone</Th>
            <Th>Congregação</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <Td>
                <AvatarContainer>
                  <AvatarFallback><User size={18} /></AvatarFallback>
                  <NameCol>
                    <NameText>{member.name}</NameText>
                    <EmailText>{member.email}</EmailText>
                  </NameCol>
                </AvatarContainer>
              </Td>
              <Td>{member.phone}</Td>
              <Td>{member.congregation}</Td>
              <Td>
                <Badge $status={member.status}>
                  {member.status === 'ACTIVE' ? 'ATIVO' : member.status === 'VISITOR' ? 'VISITANTE' : 'INATIVO'}
                </Badge>
              </Td>
              <Td>
                {canManage && (
                  <FlexRow>
                    <ActionButton title="Editar"><Edit2 size={16} /></ActionButton>
                    <ActionButton title="Excluir" onClick={() => onDelete(member.id)}><Trash2 size={16} /></ActionButton>
                  </FlexRow>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
