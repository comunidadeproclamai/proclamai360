import { useCallback, useEffect, useState } from 'react';
import { infantilService } from '../services/infantilService.js';
import { mapLiveCheckin } from '../utils/infantilFormatters.js';

export function useInfantilLive({ enabled = true } = {}) {
  const [activeChildren, setActiveChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetchLive = useCallback(async () => {
    if (!enabled) {
      setActiveChildren([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await infantilService.listLive();
      setActiveChildren(data.map(mapLiveCheckin));
    } catch (error) {
      console.error('Erro ao carregar criancas ativas:', error);
      setActiveChildren([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchLive();
  }, [fetchLive]);

  const addCheckin = async (name, age, allergies) => {
    if (!enabled) return null;

    try {
      const data = await infantilService.checkin({
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
    if (!enabled) return;

    try {
      await infantilService.checkout(id);
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
