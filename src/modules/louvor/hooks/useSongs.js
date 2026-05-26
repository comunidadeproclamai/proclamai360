import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { appConfig } from '../../../config/appConfig.js';

function isMockEnabled() {
  return import.meta.env.DEV && appConfig.authMode === 'mock';
}

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSongs = async (search = '') => {
    if (isMockEnabled()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('proclamai_mock_songs');
      let currentSongs = stored ? JSON.parse(stored) : [];
      if (search) {
        const query = search.trim().toLowerCase();
        currentSongs = currentSongs.filter(s => 
          s.title.toLowerCase().includes(query) || 
          s.artist.toLowerCase().includes(query)
        );
      }
      currentSongs.sort((a, b) => a.title.localeCompare(b.title));
      setSongs(currentSongs);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/louvor/songs', {
        params: search ? { search } : {}
      });
      setSongs(data);
    } catch (err) {
      console.error('Erro ao buscar músicas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const addSong = async (songData) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newSong = {
        ...songData,
        id: 'song-' + Math.random().toString(36).substring(2, 11),
        bpm: songData.bpm ? Number(songData.bpm) : null,
      };
      const stored = localStorage.getItem('proclamai_mock_songs');
      const currentSongs = stored ? JSON.parse(stored) : [];
      const updatedSongs = [newSong, ...currentSongs];
      localStorage.setItem('proclamai_mock_songs', JSON.stringify(updatedSongs));
      setSongs(updatedSongs.sort((a, b) => a.title.localeCompare(b.title)));
      return newSong;
    }

    try {
      const { data } = await apiClient.post('/louvor/songs', songData);
      setSongs(prev => [data, ...prev].sort((a, b) => a.title.localeCompare(b.title)));
      return data;
    } catch (err) {
      console.error('Erro ao adicionar música:', err);
      throw err;
    }
  };

  const deleteSong = async (id) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('proclamai_mock_songs');
      const currentSongs = stored ? JSON.parse(stored) : [];
      const updatedSongs = currentSongs.filter(s => s.id !== id);
      localStorage.setItem('proclamai_mock_songs', JSON.stringify(updatedSongs));
      setSongs(updatedSongs.sort((a, b) => a.title.localeCompare(b.title)));
      return;
    }

    try {
      await apiClient.delete(`/louvor/songs?id=${id}`);
      setSongs(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar música:', err);
      throw err;
    }
  };

  return {
    songs,
    isLoading,
    fetchSongs,
    addSong,
    deleteSong
  };
}
