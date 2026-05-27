import styled from 'styled-components';
import { Calendar, Music, Users, Check, X, RotateCcw, Trash2, HelpCircle } from 'lucide-react';

export function WorshipScalesList({ scales, isLoading, onConfirmAttendance, onDelete, canManage = false }) {
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return <LoadingText>Carregando escalas...</LoadingText>;
  }

  if (scales.length === 0) {
    return (
      <EmptyState>
        Nenhuma escala agendada para os próximos dias.
      </EmptyState>
    );
  }

  return (
    <ScalesGrid>
      {scales.map(scale => (
        <ScaleCard key={scale.id}>
          <CardHeader>
            <DateBadge>
              <Calendar size={16} />
              <span>{formatDate(scale.date)}</span>
            </DateBadge>
            {canManage && (
            <DeleteBtn onClick={() => {
              if (window.confirm(`Tem certeza que deseja excluir a escala "${scale.eventName}"?`)) {
                onDelete(scale.id);
              }
            }} title="Excluir Escala">
              <Trash2 size={16} />
            </DeleteBtn>
            )}
          </CardHeader>

          <EventName>{scale.eventName}</EventName>
          
          {scale.notes && (
            <NotesBlock>
              <p>{scale.notes}</p>
            </NotesBlock>
          )}

          <GridSections>
            {/* Setlist Column */}
            <Section>
              <SectionHeader>
                <Music size={16} />
                <h4>Setlist de Músicas</h4>
              </SectionHeader>
              {scale.setlist && scale.setlist.length > 0 ? (
                <SongList>
                  {scale.setlist.map((item, idx) => (
                    <SongItem key={idx}>
                      <span className="order">#{item.order}</span>
                      <SongInfo>
                        <h5>{item.song?.title || 'Música'}</h5>
                        <p>{item.song?.artist || 'Artista'}</p>
                      </SongInfo>
                      <KeyBadge>{item.customKey || item.song?.defaultKey || '—'}</KeyBadge>
                    </SongItem>
                  ))}
                </SongList>
              ) : (
                <EmptySubState>Nenhuma música no setlist.</EmptySubState>
              )}
            </Section>

            {/* Lineup Column */}
            <Section>
              <SectionHeader>
                <Users size={16} />
                <h4>Equipe Escalada</h4>
              </SectionHeader>
              {scale.lineup && scale.lineup.length > 0 ? (
                <LineupList>
                  {scale.lineup.map((item, idx) => (
                    <LineupItem key={idx}>
                      <MusicianInfo>
                        <h5>{item.member?.name || 'Membro'}</h5>
                        <p>{item.instrument}</p>
                      </MusicianInfo>
                      
                      <StatusGroup>
                        <Badge $status={item.status}>
                          {item.status === 'CONFIRMED' ? 'Confirmado' : item.status === 'DECLINED' ? 'Recusado' : 'Pendente'}
                        </Badge>
                        
                        <Actions>
                          <ActionButton 
                            title="Confirmar Presença"
                            $variant="success"
                            $active={item.status === 'CONFIRMED'}
                            onClick={() => onConfirmAttendance(scale.id, item.memberId, item.instrument, 'CONFIRMED')}
                          >
                            <Check size={14} />
                          </ActionButton>
                          <ActionButton 
                            title="Recusar Presença"
                            $variant="danger"
                            $active={item.status === 'DECLINED'}
                            onClick={() => onConfirmAttendance(scale.id, item.memberId, item.instrument, 'DECLINED')}
                          >
                            <X size={14} />
                          </ActionButton>
                          {item.status !== 'PENDING' && (
                            <ActionButton 
                              title="Resetar para Pendente"
                              $variant="pending"
                              onClick={() => onConfirmAttendance(scale.id, item.memberId, item.instrument, 'PENDING')}
                            >
                              <RotateCcw size={14} />
                            </ActionButton>
                          )}
                        </Actions>
                      </StatusGroup>
                    </LineupItem>
                  ))}
                </LineupList>
              ) : (
                <EmptySubState>Nenhum músico escalado.</EmptySubState>
              )}
            </Section>
          </GridSections>
        </ScaleCard>
      ))}
    </ScalesGrid>
  );
}

const ScalesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const ScaleCard = styled.article`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadow};
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.gold};
  font-size: 0.82rem;
  font-weight: 700;
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: rgba(223, 83, 83, 0.08);
  }
`;

const EventName = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.ice};
  letter-spacing: -0.015em;
`;

const NotesBlock = styled.div`
  background: rgba(255, 255, 255, 0.01);
  border-left: 3px solid ${({ theme }) => theme.colors.gold};
  padding: 0.6rem 0.9rem;
  border-radius: 0 ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0;
  
  p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.muted};
    font-style: italic;
  }
`;

const GridSections = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1.25rem;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.gold};

  h4 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const SongList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SongItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.01);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};

  .order {
    font-size: 0.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.gold};
  }
`;

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  h5 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ice};
  }

  p {
    margin: 0.1rem 0 0;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const KeyBadge = styled.span`
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.2);
  color: ${({ theme }) => theme.colors.gold};
  padding: 0.2rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.75rem;
  font-weight: 700;
`;

const LineupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const LineupItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.01);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const MusicianInfo = styled.div`
  display: flex;
  flex-direction: column;

  h5 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ice};
  }

  p {
    margin: 0.1rem 0 0;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  
  background: ${({ $status }) => 
    $status === 'CONFIRMED' ? 'rgba(60, 168, 118, 0.08)' :
    $status === 'DECLINED' ? 'rgba(223, 83, 83, 0.08)' :
    'rgba(255, 255, 255, 0.05)'
  };
  color: ${({ $status, theme }) => 
    $status === 'CONFIRMED' ? theme.colors.success :
    $status === 'DECLINED' ? theme.colors.danger :
    theme.colors.muted
  };
  border: 1px solid ${({ $status }) => 
    $status === 'CONFIRMED' ? 'rgba(60, 168, 118, 0.2)' :
    $status === 'DECLINED' ? 'rgba(223, 83, 83, 0.2)' :
    'rgba(255, 255, 255, 0.1)'
  };
`;

const Actions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ActionButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ $variant, theme }) => 
      $variant === 'success' ? theme.colors.success :
      $variant === 'danger' ? theme.colors.danger :
      theme.colors.gold
    };
    border-color: ${({ $variant, theme }) => 
      $variant === 'success' ? theme.colors.success :
      $variant === 'danger' ? theme.colors.danger :
      theme.colors.gold
    };
    background: ${({ $variant }) => 
      $variant === 'success' ? 'rgba(60, 168, 118, 0.08)' :
      $variant === 'danger' ? 'rgba(223, 83, 83, 0.08)' :
      'rgba(197, 165, 92, 0.08)'
    };
  }

  ${({ $active, $variant, theme }) => $active && `
    color: ${$variant === 'success' ? '#3ca876' : '#df5353'} !important;
    border-color: ${$variant === 'success' ? '#3ca876' : '#df5353'} !important;
    background: ${$variant === 'success' ? 'rgba(60, 168, 118, 0.12)' : 'rgba(223, 83, 83, 0.12)'} !important;
  `}
`;

const EmptySubState = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.mutedDark};
  font-style: italic;
  padding: 0.5rem 0;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.muted};
`;
