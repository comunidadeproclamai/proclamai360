import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useWorshipScales() {
  const [scales, setScales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScales = async () => {
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
    try {
      const { data } = await apiClient.post('/louvor/scales', scaleData);
      setScales((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erro ao adicionar escala:', err);
      throw err;
    }
  };

  const deleteScale = async (id) => {
    try {
      await apiClient.delete(`/louvor/scales?id=${id}`);
      setScales((prev) => prev.filter((scale) => scale.id !== id));
    } catch (err) {
      console.error('Erro ao deletar escala:', err);
      throw err;
    }
  };

  const confirmAttendance = async (scaleId, memberId, instrument, status) => {
    try {
      const { data } = await apiClient.put('/louvor/scales', {
        scaleId,
        memberId,
        instrument,
        status,
      });

      setScales((prev) => prev.map((scale) => {
        if (scale.id !== scaleId) return scale;

        return {
          ...scale,
          lineup: scale.lineup.map((item) => {
            if (item.memberId === memberId && item.instrument === instrument) {
              return { ...item, status };
            }
            return item;
          }),
        };
      }));

      return data;
    } catch (err) {
      console.error('Erro ao atualizar presenca na escala:', err);
      throw err;
    }
  };

  return {
    scales,
    isLoading,
    fetchScales,
    addScale,
    deleteScale,
    confirmAttendance,
  };
}
