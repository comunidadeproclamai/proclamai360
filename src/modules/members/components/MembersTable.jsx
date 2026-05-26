import styled from 'styled-components';
import { theme } from '../../../styles/theme.js';
import { Trash2, Edit2, User } from 'lucide-react';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1rem;
  font-size: 0.875rem;
  color: ${theme.colors.mutedDark};
  border-bottom: 1px solid ${theme.colors.border};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid ${theme.colors.border};
  vertical-align: middle;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AvatarFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.surfaceSoft};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.muted};
`;

const NameCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const NameText = styled.span`
  font-weight: 500;
  color: ${theme.colors.ice};
`;

const EmailText = styled.span`
  font-size: 0.8rem;
  color: ${theme.colors.mutedDark};
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $status }) => 
    $status === 'ACTIVE' ? 'rgba(70, 178, 128, 0.15)' :
    $status === 'VISITOR' ? 'rgba(214, 168, 79, 0.15)' :
    'rgba(143, 131, 131, 0.15)'
  };
  color: ${({ $status }) => 
    $status === 'ACTIVE' ? theme.colors.success :
    $status === 'VISITOR' ? theme.colors.warning :
    theme.colors.muted
  };
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.muted};
  padding: 0.5rem;
  border-radius: ${theme.radii.sm};
  transition: all 0.2s;
  
  &:hover {
    background: ${theme.colors.surfaceSoft};
    color: ${theme.colors.ice};
  }
`;

const FlexRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${theme.colors.mutedDark};
`;

export function MembersTable({ members, isLoading, onDelete }) {
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
                <FlexRow>
                  <ActionButton title="Editar"><Edit2 size={16} /></ActionButton>
                  <ActionButton title="Excluir" onClick={() => onDelete(member.id)}><Trash2 size={16} /></ActionButton>
                </FlexRow>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
