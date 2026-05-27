import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useMembers({ enabled = true } = {}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
          limit: 100,
        },
      });
      setMembers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const addMember = async (memberData) => {
    if (!enabled) return;

    try {
      await apiClient.post('/members', memberData);
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  };

  const deleteMember = async (id) => {
    if (!enabled) return;

    try {
      await apiClient.delete(`/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
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
    addMember,
    deleteMember,
  };
}
