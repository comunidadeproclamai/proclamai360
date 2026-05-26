import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSongs = async (search = '') => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/louvor/songs', {
        params: search ? { search } : {},
      });
      setSongs(data);
    } catch (err) {
      console.error('Erro ao buscar musicas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const addSong = async (songData) => {
    try {
      const { data } = await apiClient.post('/louvor/songs', songData);
      setSongs((prev) => [data, ...prev].sort((a, b) => a.title.localeCompare(b.title)));
      return data;
    } catch (err) {
      console.error('Erro ao adicionar musica:', err);
      throw err;
    }
  };

  const deleteSong = async (id) => {
    try {
      await apiClient.delete(`/louvor/songs?id=${id}`);
      setSongs((prev) => prev.filter((song) => song.id !== id));
    } catch (err) {
      console.error('Erro ao deletar musica:', err);
      throw err;
    }
  };

  return {
    songs,
    isLoading,
    fetchSongs,
    addSong,
    deleteSong,
  };
}
