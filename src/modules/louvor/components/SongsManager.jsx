import { useState } from 'react';
import styled from 'styled-components';
import { useSongs } from '../hooks/useSongs.js';
import { Search, Plus, Trash2, Music, ExternalLink, FileText, X } from 'lucide-react';

export function SongsManager() {
  const { songs, isLoading, fetchSongs, addSong, deleteSong } = useSongs();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    defaultKey: 'C',
    bpm: '',
    chordsUrl: '',
    videoUrl: '',
    lyrics: ''
  });

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchSongs(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist || !formData.defaultKey) return;
    try {
      await addSong(formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        artist: '',
        defaultKey: 'C',
        bpm: '',
        chordsUrl: '',
        videoUrl: '',
        lyrics: ''
      });
    } catch (err) {
      alert('Erro ao cadastrar música: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <Container>
      <ActionBar>
        <SearchWrapper>
          <SearchIcon size={18} />
          <Input 
            placeholder="Buscar música por título ou artista..." 
            value={search}
            onChange={handleSearchChange}
          />
        </SearchWrapper>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nova Música
        </AddButton>
      </ActionBar>

      {isLoading ? (
        <LoadingText>Carregando repertório...</LoadingText>
      ) : songs.length === 0 ? (
        <EmptyState>Nenhuma música encontrada no repertório.</EmptyState>
      ) : (
        <SongsGrid>
          {songs.map(song => (
            <SongCard key={song.id}>
              <CardHeader>
                <MusicIconWrapper>
                  <Music size={20} />
                </MusicIconWrapper>
                <HeaderDetails>
                  <h3>{song.title}</h3>
                  <p>{song.artist}</p>
                </HeaderDetails>
              </CardHeader>
              
              <MetricsRow>
                <Metric>
                  <span>Tom Padrão</span>
                  <strong>{song.defaultKey}</strong>
                </Metric>
                <Metric>
                  <span>BPM</span>
                  <strong>{song.bpm || '—'}</strong>
                </Metric>
              </MetricsRow>

              {song.lyrics && (
                <LyricsPreview>
                  <span>Letra</span>
                  <p>{song.lyrics.length > 80 ? song.lyrics.substring(0, 80) + '...' : song.lyrics}</p>
                </LyricsPreview>
              )}

              <CardActions>
                <LinksGroup>
                  {song.chordsUrl && (
                    <LinkIconButton href={song.chordsUrl} target="_blank" rel="noopener noreferrer" title="Cifra">
                      <FileText size={16} />
                    </LinkIconButton>
                  )}
                  {song.videoUrl && (
                    <LinkIconButton href={song.videoUrl} target="_blank" rel="noopener noreferrer" title="Vídeo / Guia">
                      <ExternalLink size={16} />
                    </LinkIconButton>
                  )}
                </LinksGroup>
                
                <DeleteButton onClick={() => {
                  if (window.confirm(`Excluir a música "${song.title}"?`)) {
                    deleteSong(song.id);
                  }
                }} title="Excluir música">
                  <Trash2 size={16} />
                </DeleteButton>
              </CardActions>
            </SongCard>
          ))}
        </SongsGrid>
      )}

      {isModalOpen && (
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>Adicionar Nova Música</h2>
              <CloseBtn onClick={() => setIsModalOpen(false)}><X size={20} /></CloseBtn>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Título *</Label>
                <ModalInput 
                  required
                  placeholder="Ex: A Casa É Sua"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Artista / Ministério *</Label>
                <ModalInput 
                  required
                  placeholder="Ex: Casa Worship"
                  value={formData.artist}
                  onChange={e => setFormData({...formData, artist: e.target.value})}
                />
              </FormGroup>
              <Row>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Tom Padrão *</Label>
                  <Select 
                    value={formData.defaultKey}
                    onChange={e => setFormData({...formData, defaultKey: e.target.value})}
                  >
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'].map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>BPM (Opcional)</Label>
                  <ModalInput 
                    type="number"
                    placeholder="Ex: 72"
                    value={formData.bpm}
                    onChange={e => setFormData({...formData, bpm: e.target.value})}
                  />
                </FormGroup>
              </Row>
              <FormGroup>
                <Label>Link da Cifra / Chords (Opcional)</Label>
                <ModalInput 
                  type="url"
                  placeholder="https://cifraclub.com.br/..."
                  value={formData.chordsUrl}
                  onChange={e => setFormData({...formData, chordsUrl: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Link do Vídeo / YouTube Guia (Opcional)</Label>
                <ModalInput 
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Letra (Opcional)</Label>
                <TextArea 
                  rows={4}
                  placeholder="Insira as estrofes principais..."
                  value={formData.lyrics}
                  onChange={e => setFormData({...formData, lyrics: e.target.value})}
                />
              </FormGroup>
              <SubmitBtn type="submit">Cadastrar Música</SubmitBtn>
            </Form>
          </ModalContent>
        </Overlay>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchWrapper = styled.div`
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
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.gold};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px rgba(197, 165, 92, 0.12);
  }
`;

const AddButton = styled.button`
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

const SongsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const SongCard = styled.article`
  background: ${({ theme }) => theme.colors.surface === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 22, 23, 0.7)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.shadow};
  backdrop-filter: blur(10px);
`;

const CardHeader = styled.div`
  display: flex;
  gap: 0.85rem;
  align-items: center;
`;

const MusicIconWrapper = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.wineGlow};
  border: 1px solid rgba(127, 18, 44, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gold};
`;

const HeaderDetails = styled.div`
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.ice};
    letter-spacing: -0.01em;
  }
  
  p {
    margin: 0.15rem 0 0 0;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const MetricsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.muted};
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  
  strong {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.gold};
    font-weight: 700;
    margin-top: 0.15rem;
  }
`;

const LyricsPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  span {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.muted};
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.mutedDark};
    font-style: italic;
  }
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 0.75rem;
`;

const LinksGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const LinkIconButton = styled.a`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.gold};
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(197, 165, 92, 0.08);
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.muted};
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background: rgba(223, 83, 83, 0.08);
    border-color: rgba(223, 83, 83, 0.2);
  }
`;

/* Modal Styles */
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
  width: min(100%, 30rem);
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
  
  h2 {
    margin: 0;
    font-size: 1.15rem;
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
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
`;

const ModalInput = styled.input`
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

const SubmitBtn = styled.button`
  background: ${({ theme }) => theme.colors.wine};
  color: white;
  border: 1px solid rgba(197, 165, 92, 0.15);
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(92, 6, 30, 0.25);
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.wineLight};
    box-shadow: 0 6px 20px rgba(127, 18, 44, 0.4);
    transform: translateY(-1px);
  }
`;
