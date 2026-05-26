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
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  margin: 0;
  color: ${theme.colors.ice};
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 1rem;
  font-weight: 300;
`;

const PrimaryButton = styled.button`
  background: ${theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.35);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    border-color: rgba(197, 165, 92, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 1rem;
  background: rgba(28, 22, 23, 0.7);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: ${theme.radii.md};
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  display: flex;
  align-items: center;
  
  @media (max-width: 640px) {
    max-width: 100%;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  color: ${theme.colors.muted};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(18, 14, 15, 0.6);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: ${theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1.5rem 0.75rem 1rem;
  background: rgba(18, 14, 15, 0.6);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }

  option {
    background: ${theme.colors.charcoal};
    color: ${theme.colors.ice};
  }
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
