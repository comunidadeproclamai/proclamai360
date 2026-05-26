import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient.js';

function getAgeFromBirthDate(value) {
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

function getRoomByAge(age) {
  if (age <= 2) return 'Bercario';
  if (age <= 5) return 'Maternal';
  return 'Primarios';
}

function mapLiveCheckin(item) {
  const age = getAgeFromBirthDate(item.child.birthDate);

  return {
    id: item.id,
    name: item.child.name,
    checkinTime: item.checkinTime,
    securityCode: item.securityCode,
    age,
    allergies: item.child.allergies,
    room: getRoomByAge(age),
  };
}

export function useInfantilLive() {
  const [activeChildren, setActiveChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLive = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/infantil/live');
      setActiveChildren(data.map(mapLiveCheckin));
    } catch (error) {
      console.error('Erro ao carregar criancas ativas:', error);
      setActiveChildren([]);
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
        allergies: allergies || null,
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
    refresh: fetchLive,
  };
}
