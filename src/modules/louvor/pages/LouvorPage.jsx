import { useState } from 'react';
import styled from 'styled-components';
import { Music2, Calendar, Music, Plus } from 'lucide-react';
import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { WorshipScalesList } from '../components/WorshipScalesList.jsx';
import { ScaleFormModal } from '../components/ScaleFormModal.jsx';
import { SongsManager } from '../components/SongsManager.jsx';
import { useWorshipScales } from '../hooks/useWorshipScales.js';

export function LouvorPage() {
  const { scales, isLoading, addScale, deleteScale, confirmAttendance } = useWorshipScales();
  const [activeTab, setActiveTab] = useState('scales');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveScale = async (scaleData) => {
    try {
      await addScale(scaleData);
      setIsModalOpen(false);
    } catch (err) {
      alert('Erro ao agendar escala: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Ministério"
        title="Louvor & Escalas"
        description="Gerencie a escala de cultos, equipe de instrumentistas, vocais e o repertório de músicas da congregação."
        icon={Music2}
      />

      <TabsRow>
        <TabsGroup>
          <TabButton 
            $active={activeTab === 'scales'} 
            onClick={() => setActiveTab('scales')}
          >
            <Calendar size={16} />
            <span>Escalas de Culto</span>
          </TabButton>
          <TabButton 
            $active={activeTab === 'songs'} 
            onClick={() => setActiveTab('songs')}
          >
            <Music size={16} />
            <span>Repertório / Músicas</span>
          </TabButton>
        </TabsGroup>

        {activeTab === 'scales' && (
          <CreateBtn onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Agendar Escala
          </CreateBtn>
        )}
      </TabsRow>

      <ContentArea>
        {activeTab === 'scales' ? (
          <WorshipScalesList 
            scales={scales} 
            isLoading={isLoading} 
            onConfirmAttendance={confirmAttendance} 
            onDelete={deleteScale}
          />
        ) : (
          <SongsManager />
        )}
      </ContentArea>

      {isModalOpen && (
        <ScaleFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveScale}
        />
      )}
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.4s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TabsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 1rem;
  gap: 1.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TabsGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(18, 14, 15, 0.4);
  padding: 0.35rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: fit-content;
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.35rem;
  padding: 0 1.25rem;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 640px) {
    flex: 1;
    justify-content: center;
  }

  svg {
    color: ${({ theme }) => theme.colors.muted};
    transition: color 0.2s ease;
  }

  &:hover:not([data-active='true']) {
    color: ${({ theme }) => theme.colors.ice};
    background: rgba(255, 255, 255, 0.03);
  }

  ${({ $active, theme }) => $active && `
    background: ${theme.colors.wine} !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(92, 6, 30, 0.3);
    
    svg {
      color: ${theme.colors.gold} !important;
    }
  `}
`;

const CreateBtn = styled.button`
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
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-2px);
  }
  
  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const ContentArea = styled.div`
  min-height: 400px;
`;

