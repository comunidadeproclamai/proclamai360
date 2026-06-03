import { useCallback, useEffect, useState } from 'react';
import { infantilService } from '../services/infantilService.js';
import { mapChildRecord, mapLiveCheckin } from '../utils/infantilFormatters.js';
import { realtimeService } from '../../../services/realtimeService.js';

export function useInfantilAdmin({ enabled = true } = {}) {
  const [activeChildren, setActiveChildren] = useState([]);
  const [children, setChildren] = useState([]);
  const [history, setHistory] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInfantilData = useCallback(async () => {
    if (!enabled) {
      setActiveChildren([]);
      setChildren([]);
      setHistory([]);
      setGuardians([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [liveData, childrenData, historyData, guardiansData] = await Promise.all([
        infantilService.listLive(),
        infantilService.listChildren(),
        infantilService.listHistory(),
        infantilService.listGuardians(),
      ]);

      setActiveChildren(liveData.map(mapLiveCheckin));
      setChildren(childrenData.map(mapChildRecord));
      setHistory(historyData);
      setGuardians(guardiansData);
    } catch (error) {
      console.error('Erro ao carregar modulo infantil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadInfantilData();
  }, [loadInfantilData]);

  // Realtime updates
  useEffect(() => {
    if (!enabled) return;
    
    const channelInserts = realtimeService.subscribeToInserts('infantilCheckin', () => {
      loadInfantilData();
    });
    
    const channelUpdates = realtimeService.subscribeToUpdates('infantilCheckin', () => {
      loadInfantilData();
    });

    return () => {
      realtimeService.unsubscribe(channelInserts);
      realtimeService.unsubscribe(channelUpdates);
    };
  }, [enabled, loadInfantilData]);

  const createQuickCheckin = async (payload) => {
    if (!enabled) return null;

    try {
      setIsSubmitting(true);
      const checkinPayload = payload.childId
        ? {
            childId: payload.childId,
            guardianId: payload.guardianId || null,
          }
        : {
            ...payload,
            age: Number(payload.age),
            allergies: payload.allergies || null,
          };
      const checkin = await infantilService.checkin(checkinPayload);
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

  const createGuardian = async (payload) => {
    if (!enabled) return null;

    try {
      setIsSubmitting(true);
      const guardian = await infantilService.createGuardian(payload);
      await loadInfantilData();
      return guardian;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutChild = async (id, securityCode) => {
    if (!enabled) return;

    try {
      setIsSubmitting(true);
      await infantilService.checkout(id, securityCode);
      await loadInfantilData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeChildren,
    children,
    guardians,
    history,
    isLoading,
    isSubmitting,
    createQuickCheckin,
    createChild,
    createGuardian,
    checkoutChild,
    refresh: loadInfantilData,
  };
}
