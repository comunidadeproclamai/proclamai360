import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMembers = useCallback(async () => {
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
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const addMember = async (memberData) => {
    try {
      await apiClient.post('/members', memberData);
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  };

  const deleteMember = async (id) => {
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
