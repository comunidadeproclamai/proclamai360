import { createContext, useContext, useEffect, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import { useToast } from './ToastContext';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../lib/permissions';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const subscriptions = [];

    // 1. Escutar check-ins infantis (apenas para quem tem permissão)
    if (hasPermission(user, PERMISSIONS.CHILDREN_READ)) {
      const channel = realtimeService.subscribeToInserts('InfantilCheckin', (newCheckin) => {
        toast.info(`Novo check-in no Ministério Infantil.`);
        addNotification({
          id: Date.now(),
          type: 'infantil',
          title: 'Novo Check-in',
          message: 'Uma criança acabou de ser registrada nas salas.',
          time: new Date(),
          read: false,
        });
      });
      subscriptions.push(channel);
    }

    // 2. Escutar lançamentos financeiros
    if (hasPermission(user, PERMISSIONS.FINANCIAL_READ)) {
      const channel = realtimeService.subscribeToInserts('FinancialTransaction', (tx) => {
        if (tx.amount >= 1000) { // Notifica apenas lançamentos grandes
          toast.success(`Lançamento financeiro recebido: R$ ${tx.amount}`);
          addNotification({
            id: Date.now(),
            type: 'financeiro',
            title: 'Lançamento Relevante',
            message: `Um lançamento de R$ ${tx.amount} foi registrado.`,
            time: new Date(),
            read: false,
          });
        }
      });
      subscriptions.push(channel);
    }

    return () => {
      subscriptions.forEach((ch) => realtimeService.unsubscribe(ch));
    };
  }, [user, toast]);

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev].slice(0, 20)); // Keep last 20
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <RealtimeContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
