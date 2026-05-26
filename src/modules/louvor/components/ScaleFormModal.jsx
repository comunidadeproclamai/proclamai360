import { useState } from 'react';
import styled from 'styled-components';
import { useMembers } from '../../members/hooks/useMembers.js';
import { useSongs } from '../hooks/useSongs.js';
import { X, Plus, Trash2, Calendar, UserPlus, Music, FileText } from 'lucide-react';

export function ScaleFormModal({ onClose, onSave }) {
  const { members } = useMembers();
  const { songs } = useSongs();

  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Lineup state: array of { memberId, instrument }
  const [lineup, setLineup] = useState([]);
  // Setlist state: array of { songId, customKey }
  const [setlist, setSetlist] = useState([]);

  // Form states for temporary adds
  const [tempMember, setTempMember] = useState({ memberId: '', instrument: '' });
  const [tempSong, setTempSong] = useState({ songId: '', customKey: '' });

  const handleAddLineup = () => {
    if (!tempMember.memberId || !tempMember.instrument) return;
    // Check if already in lineup
    if (lineup.some(item => item.memberId === tempMember.memberId && item.instrument === tempMember.instrument)) {
      alert('Este músico já foi adicionado para este instrumento.');
      return;
    }
    setLineup([...lineup, { ...tempMember }]);
    setTempMember({ memberId: '', instrument: '' });
  };

  const handleRemoveLineup = (index) => {
    setLineup(lineup.filter((_, idx) => idx !== index));
  };

  const handleAddSetlist = () => {
    if (!tempSong.songId) return;
    if (setlist.some(item => item.songId === tempSong.songId)) {
      alert('Esta música já está no setlist.');
      return;
    }
    // Lookup default key to pre-populate customKey if not entered
    const songObj = songs.find(s => s.id === tempSong.songId);
    const keyToUse = tempSong.customKey || songObj?.defaultKey || 'C';

    setSetlist([...setlist, { songId: tempSong.songId, customKey: keyToUse }]);
    setTempSong({ songId: '', customKey: '' });
  };

  const handleRemoveSetlist = (index) => {
    setSetlist(setlist.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventName || !date) {
      alert('Nome do evento e data são obrigatórios.');
      return;
    }

    // Format lineup and setlist with orders
    const formattedSetlist = setlist.map((item, idx) => ({
      songId: item.songId,
      order: idx + 1,
      customKey: item.customKey
    }));

    onSave({
      eventName,
      date,
      notes,
      lineup,
      setlist: formattedSetlist
    });
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <TitleRow>
            <Calendar size={22} style={{ color: '#c5a55c' }} />
            <h2>Agendar Nova Escala</h2>
          </TitleRow>
          <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ScrollArea>
            {/* General Info */}
            <Section>
              <SectionTitle>Dados Gerais</SectionTitle>
              <FormGroup>
                <Label>Nome do Evento *</Label>
                <Input 
                  required 
                  placeholder="Ex: Culto de Celebração - Domingo" 
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Data & Horário *</Label>
                <Input 
                  required 
                  type="datetime-local" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Anotações / Instruções (Opcional)</Label>
                <TextArea 
                  rows={2} 
                  placeholder="Ex: Passagem de som às 18:00, ensaio geral no sábado às 16:00..." 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </FormGroup>
            </Section>

            {/* Lineup / Musicians Section */}
            <Section>
              <SectionTitle>Equipe de Músicos & Vocais</SectionTitle>
              
              <MiniForm>
                <SelectGroup style={{ flex: 1.5 }}>
                  <Label>Membro da Equipe</Label>
                  <Select 
                    value={tempMember.memberId} 
                    onChange={e => setTempMember({...tempMember, memberId: e.target.value})}
                  >
                    <option value="">Selecione um membro...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </SelectGroup>
                
                <SelectGroup style={{ flex: 1 }}>
                  <Label>Função / Instrumento</Label>
                  <Input 
                    placeholder="Teclado, Vocal Lead..." 
                    value={tempMember.instrument}
                    onChange={e => setTempMember({...tempMember, instrument: e.target.value})}
                  />
                </SelectGroup>

                <AddIconButton type="button" onClick={handleAddLineup} title="Escalar Músico">
                  <UserPlus size={18} />
                </AddIconButton>
              </MiniForm>

              {lineup.length > 0 && (
                <ItemsList>
                  {lineup.map((item, idx) => {
                    const memberName = members.find(m => m.id === item.memberId)?.name || 'Membro';
                    return (
                      <ListItem key={idx}>
                        <div>
                          <strong>{memberName}</strong>
                          <span> — {item.instrument}</span>
                        </div>
                        <RemoveButton type="button" onClick={() => handleRemoveLineup(idx)}>
                          <Trash2 size={15} />
                        </RemoveButton>
                      </ListItem>
                    );
                  })}
                </ItemsList>
              )}
            </Section>

            {/* Setlist Section */}
            <Section>
              <SectionTitle>Repertório / Setlist de Músicas</SectionTitle>

              <MiniForm>
                <SelectGroup style={{ flex: 1.5 }}>
                  <Label>Música</Label>
                  <Select 
                    value={tempSong.songId} 
                    onChange={e => setTempSong({...tempSong, songId: e.target.value})}
                  >
                    <option value="">Selecione uma música...</option>
                    {songs.map(s => (
                      <option key={s.id} value={s.id}>{s.title} ({s.artist})</option>
                    ))}
                  </Select>
                </SelectGroup>

                <SelectGroup style={{ flex: 0.8 }}>
                  <Label>Tom da Escala</Label>
                  <Input 
                    placeholder="Deixar padrão" 
                    value={tempSong.customKey}
                    onChange={e => setTempSong({...tempSong, customKey: e.target.value})}
                  />
                </SelectGroup>

                <AddIconButton type="button" onClick={handleAddSetlist} title="Adicionar Música">
                  <Music size={18} />
                </AddIconButton>
              </MiniForm>

              {setlist.length > 0 && (
                <ItemsList>
                  {setlist.map((item, idx) => {
                    const songObj = songs.find(s => s.id === item.songId);
                    return (
                      <ListItem key={idx}>
                        <div>
                          <strong>#{idx + 1} {songObj?.title || 'Música'}</strong>
                          <span> — {songObj?.artist || 'Artista'} (Tom: {item.customKey})</span>
                        </div>
                        <RemoveButton type="button" onClick={() => handleRemoveSetlist(idx)}>
                          <Trash2 size={15} />
                        </RemoveButton>
                      </ListItem>
                    );
                  })}
                </ItemsList>
              )}
            </Section>
          </ScrollArea>

          <Footer>
            <SubmitBtn type="submit">Agendar Escala</SubmitBtn>
          </Footer>
        </Form>
      </ModalContent>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  width: min(100%, 34rem);
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScrollArea = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  overflow-y: auto;
  max-height: 60vh;
`;

const Section = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.legend`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
`;

const Input = styled.input`
  padding: 0.7rem 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const Select = styled.select`
  padding: 0.7rem 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }

  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.ice};
  }
`;

const TextArea = styled.textarea`
  padding: 0.7rem 0.85rem;
  background: ${({ theme }) => theme.colors.surfaceSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.ice};
  font-size: 0.95rem;
  outline: none;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const MiniForm = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const AddIconButton = styled.button`
  background: ${({ theme }) => theme.colors.wineGlow};
  color: ${({ theme }) => theme.colors.gold};
  border: 1px solid rgba(197, 165, 92, 0.2);
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.wine};
    color: white;
    border-color: ${({ theme }) => theme.colors.gold};
  }
`;

const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ListItem = styled.li`
  background: rgba(255,255,255,0.02);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.6rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  justify-content: space-between;
  align-items: center;

  div {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.ice};
  }

  strong {
    color: ${({ theme }) => theme.colors.ice};
    font-weight: 600;
  }

  span {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const Footer = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSoft};
  display: flex;
  justify-content: flex-end;
`;

const SubmitBtn = styled.button`
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-1px);
  }
`;
