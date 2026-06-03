import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { realtimeService } from '../../../services/realtimeService.js';

export function useMembers({ enabled = true } = {}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const toast = useToast();

  const fetchMembers = useCallback(async () => {
    if (!enabled) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await apiClient.get('/members', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page,
          limit,
        },
      });
      setMembers(data.data || []);
      setTotalPages(data.meta.totalPages || 1);
    } catch (error) {
      toast.error('Erro ao carregar os membros. Tente novamente.');
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, search, statusFilter, page, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  // Realtime updates
  useEffect(() => {
    if (!enabled) return;
    const channel = realtimeService.subscribeToInserts('members', () => {
      fetchMembers();
    });
    return () => realtimeService.unsubscribe(channel);
  }, [enabled, fetchMembers]);

  const addMember = async (memberData) => {
    try {
      await apiClient.post('/members', memberData);
      toast.success('Membro cadastrado com sucesso!');
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar membro.');
      throw error;
    }
  };

  const updateMember = async (id, memberData) => {
    try {
      await apiClient.put(`/members/${id}`, memberData);
      toast.success('Membro atualizado com sucesso!');
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar membro.');
      throw error;
    }
  };

  const deleteMember = async (id) => {
    try {
      await apiClient.delete(`/members/${id}`);
      toast.success('Membro inativado com sucesso.');
      fetchMembers();
    } catch (error) {
      toast.error('Erro ao inativar membro.');
      throw error;
    }
  };

  return {
    members,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    addMember,
    updateMember,
    deleteMember,
  };
}
