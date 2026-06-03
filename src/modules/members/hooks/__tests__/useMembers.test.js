import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembers } from '../useMembers';
import { apiClient } from '../../../../services/apiClient';

vi.mock('../../../../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../../../contexts/ToastContext.jsx', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('../../../../services/realtimeService.js', () => ({
  realtimeService: {
    subscribeToInserts: vi.fn().mockReturnValue('mock_channel'),
    unsubscribe: vi.fn(),
  },
}));

describe('useMembers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches members successfully', async () => {
    const mockData = {
      data: [{ id: '1', name: 'João Silva' }],
      meta: { totalPages: 2 },
    };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useMembers());

    expect(result.current.isLoading).toBe(true);
    
    // Wait for the debounce timeout and the API call
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(apiClient.get).toHaveBeenCalledWith('/members', expect.objectContaining({
      params: expect.objectContaining({
        page: 1,
        limit: 10,
      }),
    }));
    expect(result.current.members).toEqual(mockData.data);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.isLoading).toBe(false);
  });

  it('adds member successfully', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [], meta: {} } });
    apiClient.post.mockResolvedValueOnce({});
    
    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await result.current.addMember({ name: 'Maria Souza' });
    });

    expect(apiClient.post).toHaveBeenCalledWith('/members', { name: 'Maria Souza' });
    expect(apiClient.get).toHaveBeenCalled(); // Should trigger a re-fetch
  });

  it('updates member successfully', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [], meta: {} } });
    apiClient.put.mockResolvedValueOnce({});
    
    const { result } = renderHook(() => useMembers());

    await act(async () => {
      await result.current.updateMember('1', { name: 'João Updated' });
    });

    expect(apiClient.put).toHaveBeenCalledWith('/members/1', { name: 'João Updated' });
    expect(apiClient.get).toHaveBeenCalled();
  });
});
