import { describe, it, expect, vi } from 'vitest';
import { getPublicUrl, STORAGE_BUCKETS } from '../storageService';
import { supabase } from '../../lib/supabaseClient';

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        getPublicUrl: vi.fn().mockImplementation((path) => ({
          data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/bucket/${path}` },
        })),
        upload: vi.fn(),
        remove: vi.fn(),
      }),
    },
  },
}));

describe('storageService', () => {
  describe('getPublicUrl', () => {
    it('returns null if path is undefined', () => {
      expect(getPublicUrl(STORAGE_BUCKETS.MEMBERS, null)).toBeNull();
    });

    it('returns formatted public url from supabase', () => {
      const url = getPublicUrl(STORAGE_BUCKETS.MEMBERS, '123/photo.jpg');
      expect(url).toBe('https://mock.supabase.co/storage/v1/object/public/bucket/123/photo.jpg');
      expect(supabase.storage.from).toHaveBeenCalledWith(STORAGE_BUCKETS.MEMBERS);
    });
  });
});
