import { useState } from 'react';
import styled from 'styled-components';
import { useMembers } from '../hooks/useMembers.js';
import { MembersTable } from '../components/MembersTable.jsx';
import { MemberFormModal } from '../components/MemberFormModal.jsx';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { PERMISSIONS, hasPermission } from '../../../lib/permissions.js';
import { Pagination } from '../../../components/common/Pagination.jsx';
import { ExportButton } from '../../../components/common/ExportButton.jsx';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog.jsx';
import { exportToExcel, exportToPDF } from '../../../services/exportService.js';

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
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.colors.ice};
  letter-spacing: -0.01em;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 1rem;
  font-weight: 400;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
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
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow};

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
  color: ${({ theme }) => theme.colors.muted};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mutedDark};
    opacity: 0.7;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }
`;

const Select = styled.select`
  padding: 0.75rem 2rem 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }

  option {
    background: ${({ theme }) => theme.colors.charcoal};
    color: ${({ theme }) => theme.colors.surface === '#ffffff' ? '#221518' : '#fcfaf7'};
  }
`;

export function MembersPage() {
  const { user } = useAuth();
  const canManageMembers = hasPermission(user, PERMISSIONS.MEMBERS_WRITE);
  
  const { 
    members, isLoading, search, setSearch, statusFilter, setStatusFilter, 
    page, setPage, totalPages, addMember, updateMember, deleteMember 
  } = useMembers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleEdit = (member) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (memberToEdit) {
      await updateMember(memberToEdit.id, data);
    } else {
      await addMember(data);
    }
  };

  const handleDelete = async () => {
    if (confirmDeleteId) {
      await deleteMember(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const exportColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone' },
    { key: 'cpf', label: 'CPF' },
    { key: 'status', label: 'Status' },
    { key: 'congregation', label: 'Congregação' },
  ];

  const handleExportExcel = async () => {
    exportToExcel(members, exportColumns, 'Membros.xlsx');
  };

  const handleExportPDF = async () => {
    exportToPDF(members, exportColumns, 'Relatório de Membros', 'Membros.pdf');
  };

  return (
    <PageContainer>
      <Header>
        <TitleBlock>
          <Title>Membros</Title>
          <Subtitle>Gerencie os cadastros e dados pessoais da congregação.</Subtitle>
        </TitleBlock>
        <HeaderActions>
          <ExportButton 
            onExportExcel={handleExportExcel} 
            onExportPDF={handleExportPDF} 
            disabled={members.length === 0} 
          />
          {canManageMembers && (
            <PrimaryButton onClick={handleAddNew}>
              <Plus size={20} />
              Novo Membro
            </PrimaryButton>
          )}
        </HeaderActions>
      </Header>

      <FiltersBar>
        <SearchInputWrapper>
          <SearchIcon size={18} />
          <Input 
            placeholder="Buscar por nome, e-mail ou CPF..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </SearchInputWrapper>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">Todos os Status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="VISITOR">Visitantes</option>
          <option value="INACTIVE">Inativos</option>
        </Select>
      </FiltersBar>

      <MembersTable
        members={members}
        isLoading={isLoading}
        onDelete={id => setConfirmDeleteId(id)}
        onEdit={handleEdit}
        canManage={canManageMembers}
      />

      {!isLoading && members.length > 0 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {isModalOpen && canManageMembers && (
        <MemberFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
          memberToEdit={memberToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Inativar Membro"
        message="Tem certeza que deseja inativar este membro? Ele perderá acesso ao painel."
        confirmLabel="Sim, inativar"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </PageContainer>
  );
}
