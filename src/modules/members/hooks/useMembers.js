import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../services/apiClient.js';
import { appConfig } from '../../../config/appConfig.js';

function isMockEnabled() {
  return import.meta.env.DEV && appConfig.authMode === 'mock';
}

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('proclamai_mock_members');
      let currentMembers = stored ? JSON.parse(stored) : [];

      if (search) {
        const query = search.trim().toLowerCase();
        currentMembers = currentMembers.filter(m => 
          m.name.toLowerCase().includes(query) || 
          m.email.toLowerCase().includes(query)
        );
      }

      if (statusFilter !== 'ALL') {
        currentMembers = currentMembers.filter(m => m.status === statusFilter);
      }

      setMembers(currentMembers);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get('/members', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          limit: 100
        }
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
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newMember = {
        ...memberData,
        id: 'member-' + Math.random().toString(36).substring(2, 11),
      };

      const stored = localStorage.getItem('proclamai_mock_members');
      const currentMembers = stored ? JSON.parse(stored) : [];
      const updatedList = [newMember, ...currentMembers];
      localStorage.setItem('proclamai_mock_members', JSON.stringify(updatedList));
      
      fetchMembers();
      return;
    }

    try {
      await apiClient.post('/members', memberData);
      fetchMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    }
  };

  const deleteMember = async (id) => {
    if (isMockEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('proclamai_mock_members');
      const currentMembers = stored ? JSON.parse(stored) : [];
      const updatedList = currentMembers.filter(m => m.id !== id);
      localStorage.setItem('proclamai_mock_members', JSON.stringify(updatedList));
      
      fetchMembers();
      return;
    }

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
