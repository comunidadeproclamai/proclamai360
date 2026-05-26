import { useState } from 'react';
import styled from 'styled-components';
import { useMembers } from '../hooks/useMembers.js';
import { MembersTable } from '../components/MembersTable.jsx';
import { MemberFormModal } from '../components/MemberFormModal.jsx';
import { theme } from '../../../styles/theme.js';
import { Plus, Search, Filter } from 'lucide-react';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.ice};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.mutedDark};
  font-size: 1rem;
`;

const PrimaryButton = styled.button`
  background: ${theme.colors.wine};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(138, 31, 61, 0.3);
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.wineLight};
    transform: translateY(-2px);
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 1rem;
  background: ${theme.colors.surface};
  padding: 1rem;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  color: ${theme.colors.muted};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${theme.colors.charcoal};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.wine};
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  background: ${theme.colors.charcoal};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;
`;

export function MembersPage() {
  const { members, isLoading, search, setSearch, statusFilter, setStatusFilter, addMember, deleteMember } = useMembers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Membros</Title>
          <Subtitle>Gerencie os cadastros e dados pessoais da congregação.</Subtitle>
        </TitleBlock>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Novo Membro
        </PrimaryButton>
      </Header>

      <FiltersBar>
        <SearchInputWrapper>
          <SearchIcon size={18} />
          <Input 
            placeholder="Buscar por nome ou e-mail..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchInputWrapper>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Todos os Status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="VISITOR">Visitantes</option>
          <option value="INACTIVE">Inativos</option>
        </Select>
      </FiltersBar>

      <MembersTable members={members} isLoading={isLoading} onDelete={deleteMember} />

      {isModalOpen && (
        <MemberFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={addMember} 
        />
      )}
    </PageContainer>
  );
}
