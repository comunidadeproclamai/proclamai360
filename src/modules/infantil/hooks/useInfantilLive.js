import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useInfantilLive() {
  const [activeChildren, setActiveChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLive = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/infantil/live');
      
      const mapped = data.map(item => {
        const birthDate = new Date(item.child.birthDate);
        let age = new Date().getFullYear() - birthDate.getFullYear();
        const m = new Date().getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
          age--;
        }
        age = Math.max(0, age);

        // Determine room based on age
        let room = 'Primários';
        if (age <= 2) room = 'Berçário';
        else if (age <= 5) room = 'Maternal';

        return {
          id: item.id, // check-in ID for checkout
          name: item.child.name,
          checkinTime: item.checkinTime,
          securityCode: item.securityCode,
          age,
          allergies: item.child.allergies,
          room
        };
      });

      setActiveChildren(mapped);
    } catch (error) {
      console.error('Erro ao carregar crianças ativas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  const addCheckin = async (name, age, allergies) => {
    try {
      const { data } = await apiClient.post('/infantil/checkin', {
        name,
        age: Number(age),
        allergies: allergies || null
      });
      await fetchLive();
      return data.securityCode;
    } catch (error) {
      console.error('Erro ao realizar checkin:', error);
      throw error;
    }
  };

  const doCheckout = async (id) => {
    try {
      await apiClient.delete(`/infantil/checkin?id=${id}`);
      await fetchLive();
    } catch (error) {
      console.error('Erro ao realizar checkout:', error);
      throw error;
    }
  };

  return {
    activeChildren,
    isLoading,
    addCheckin,
    doCheckout,
    refresh: fetchLive
  };
}
