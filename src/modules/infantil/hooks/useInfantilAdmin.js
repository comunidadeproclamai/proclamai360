import { useCallback, useEffect, useState } from 'react';
import { infantilService } from '../services/infantilService.js';
import { mapChildRecord, mapLiveCheckin } from '../utils/infantilFormatters.js';

export function useInfantilAdmin({ enabled = true } = {}) {
  const [activeChildren, setActiveChildren] = useState([]);
  const [children, setChildren] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInfantilData = useCallback(async () => {
    if (!enabled) {
      setActiveChildren([]);
      setChildren([]);
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [liveData, childrenData, historyData] = await Promise.all([
        infantilService.listLive(),
        infantilService.listChildren(),
        infantilService.listHistory(),
      ]);

      setActiveChildren(liveData.map(mapLiveCheckin));
      setChildren(childrenData.map(mapChildRecord));
      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao carregar modulo infantil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadInfantilData();
  }, [loadInfantilData]);

  const createQuickCheckin = async (payload) => {
    if (!enabled) return null;

    try {
      setIsSubmitting(true);
      const checkin = await infantilService.checkin({
        ...payload,
        age: Number(payload.age),
        allergies: payload.allergies || null,
      });
      await loadInfantilData();
      return checkin.securityCode;
    } finally {
      setIsSubmitting(false);
    }
  };

  const createChild = async (payload) => {
    if (!enabled) return null;

    try {
      setIsSubmitting(true);
      const child = await infantilService.createChild({
        ...payload,
        age: Number(payload.age),
        allergies: payload.allergies || null,
        specialNeeds: payload.specialNeeds || null,
      });
      await loadInfantilData();
      return child;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutChild = async (id) => {
    if (!enabled) return;
    await infantilService.checkout(id);
    await loadInfantilData();
  };

  return {
    activeChildren,
    children,
    history,
    isLoading,
    isSubmitting,
    createQuickCheckin,
    createChild,
    checkoutChild,
    refresh: loadInfantilData,
  };
}
