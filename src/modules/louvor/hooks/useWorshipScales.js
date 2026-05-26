import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { appConfig } from '../../../config/appConfig.js';

function isMockEnabled() {
  return import.meta.env.DEV && appConfig.authMode === 'mock';
}

export function useWorshipScales() {
  const [scales, setScales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchScales = async () => {
    if (isMockEnabled()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('proclamai_mock_scales');
      setScales(stored ? JSON.parse(stored) : []);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/louvor/scales');
      setScales(data);
    } catch (err) {
      console.error('Erro ao buscar escalas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScales();
  }, []);

  const addScale = async (scaleData) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));

      // Resolve member and song details from localStorage to keep state fully linked
      const storedMembers = localStorage.getItem('proclamai_mock_members');
      const mockMembers = storedMembers ? JSON.parse(storedMembers) : [];

      const storedSongs = localStorage.getItem('proclamai_mock_songs');
      const mockSongs = storedSongs ? JSON.parse(storedSongs) : [];

      const resolvedLineup = (scaleData.lineup || []).map(item => {
        const matchedMember = mockMembers.find(m => m.id === item.memberId);
        return {
          memberId: item.memberId,
          instrument: item.instrument,
          status: 'PENDING',
          member: matchedMember ? { id: matchedMember.id, name: matchedMember.name, phone: matchedMember.phone } : { id: item.memberId, name: 'Membro Teste', phone: '' }
        };
      });

      const resolvedSetlist = (scaleData.setlist || []).map((item, idx) => {
        const matchedSong = mockSongs.find(s => s.id === item.songId);
        return {
          songId: item.songId,
          order: item.order !== undefined ? Number(item.order) : idx + 1,
          customKey: item.customKey || null,
          song: matchedSong ? { id: matchedSong.id, title: matchedSong.title, artist: matchedSong.artist, defaultKey: matchedSong.defaultKey } : { id: item.songId, title: 'Música Teste', artist: '', defaultKey: 'A' }
        };
      });

      const newScale = {
        id: 'scale-' + Math.random().toString(36).substring(2, 11),
        date: new Date(scaleData.date).toISOString(),
        eventName: scaleData.eventName,
        notes: scaleData.notes || null,
        lineup: resolvedLineup,
        setlist: resolvedSetlist
      };

      const stored = localStorage.getItem('proclamai_mock_scales');
      const currentScales = stored ? JSON.parse(stored) : [];
      const updatedScales = [newScale, ...currentScales];
      localStorage.setItem('proclamai_mock_scales', JSON.stringify(updatedScales));
      setScales(updatedScales);
      return newScale;
    }

    try {
      const { data } = await apiClient.post('/louvor/scales', scaleData);
      setScales(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar escala:', err);
      throw err;
    }
  };

  const deleteScale = async (id) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('proclamai_mock_scales');
      const currentScales = stored ? JSON.parse(stored) : [];
      const updatedScales = currentScales.filter(s => s.id !== id);
      localStorage.setItem('proclamai_mock_scales', JSON.stringify(updatedScales));
      setScales(updatedScales);
      return;
    }

    try {
      await apiClient.delete(`/louvor/scales?id=${id}`);
      setScales(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar escala:', err);
      throw err;
    }
  };

  const confirmAttendance = async (scaleId, memberId, instrument, status) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('proclamai_mock_scales');
      const currentScales = stored ? JSON.parse(stored) : [];
      const updatedScales = currentScales.map(scale => {
        if (scale.id !== scaleId) return scale;
        return {
          ...scale,
          lineup: scale.lineup.map(item => {
            if (item.memberId === memberId && item.instrument === instrument) {
              return { ...item, status };
            }
            return item;
          })
        };
      });
      localStorage.setItem('proclamai_mock_scales', JSON.stringify(updatedScales));
      setScales(updatedScales);
      return { success: true };
    }

    try {
      const { data } = await apiClient.put('/louvor/scales', {
        scaleId,
        memberId,
        instrument,
        status
      });
      
      setScales(prev => prev.map(scale => {
        if (scale.id !== scaleId) return scale;
        return {
          ...scale,
          lineup: scale.lineup.map(item => {
            if (item.memberId === memberId && item.instrument === instrument) {
              return { ...item, status };
            }
            return item;
          })
        };
      }));
      
      return data;
    } catch (err) {
      console.error('Erro ao atualizar presença na escala:', err);
      throw err;
    }
  };

  return {
    scales,
    isLoading,
    fetchScales,
    addScale,
    deleteScale,
    confirmAttendance
  };
}
