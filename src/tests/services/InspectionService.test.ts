import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import type { Inspection, InspectionItem } from '../../types/inspection';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}));

describe('InspectionService', () => {
  const mockInspection: Inspection = {
    id: '123',
    client_id: '456',
    inspection_date: '2024-03-15',
    location: 'Test Location',
    inspector: 'John Doe',
    status: 'scheduled',
    notes: 'Test notes',
    cover_page: true,
  };

  const mockItems: InspectionItem[] = [
    {
      item_type: 'Fire Extinguisher',
      floor: '1',
      room: '101',
      equipment_type: '5ABC',
      status: 'pass',
      notes: 'Test item',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list()', () => {
    it('should fetch inspections successfully', async () => {
      const mockResponse = { data: [mockInspection], error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: () => ({
          order: () => Promise.resolve(mockResponse),
        }),
      } as any));

      const result = await api.inspections.list();
      expect(result).toEqual([mockInspection]);
    });

    it('should handle errors when fetching inspections', async () => {
      const mockError = new Error('Database error');
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: () => Promise.reject(mockError),
      } as any));

      await expect(api.inspections.list()).rejects.toThrow('Failed to fetch inspections');
    });
  });

  describe('create()', () => {
    it('should create inspection with items successfully', async () => {
      const mockInsertResponse = { data: mockInspection, error: null };
      const mockItemsResponse = { data: mockItems, error: null };

      vi.spyOn(supabase, 'from').mockImplementation((table) => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve(mockInsertResponse),
          }),
        }),
        ...(table === 'inspection_items' && {
          insert: () => Promise.resolve(mockItemsResponse),
        }),
      } as any));

      const result = await api.inspections.create(mockInspection, mockItems);
      expect(result).toEqual(mockInspection);
    });

    it('should handle file uploads during inspection creation', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockUploadResponse = { data: { path: 'test.pdf' }, error: null };

      vi.spyOn(supabase.storage, 'from').mockImplementation(() => ({
        upload: () => Promise.resolve(mockUploadResponse),
        getPublicUrl: () => ({ data: { publicUrl: 'https://test.com/test.pdf' } }),
      } as any));

      await api.inspections.uploadFiles('123', [mockFile]);
      expect(supabase.storage.from).toHaveBeenCalledWith('inspection-files');
    });
  });

  describe('update()', () => {
    it('should update inspection and items successfully', async () => {
      const mockUpdateResponse = { data: null, error: null };
      
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        update: () => ({
          eq: () => Promise.resolve(mockUpdateResponse),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
        insert: () => Promise.resolve({ error: null }),
      } as any));

      await api.inspections.update('123', mockInspection, mockItems);
      expect(supabase.from).toHaveBeenCalledWith('inspections');
    });

    it('should handle errors during update', async () => {
      const mockError = new Error('Update failed');
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        update: () => ({
          eq: () => Promise.reject(mockError),
        }),
      } as any));

      await expect(api.inspections.update('123', mockInspection)).rejects.toThrow('Failed to update inspection');
    });
  });

  describe('delete()', () => {
    it('should delete inspection successfully', async () => {
      const mockDeleteResponse = { error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        delete: () => ({
          eq: () => Promise.resolve(mockDeleteResponse),
        }),
      } as any));

      await api.inspections.delete('123');
      expect(supabase.from).toHaveBeenCalledWith('inspections');
    });

    it('should handle errors during deletion', async () => {
      const mockError = new Error('Delete failed');
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        delete: () => ({
          eq: () => Promise.reject(mockError),
        }),
      } as any));

      await expect(api.inspections.delete('123')).rejects.toThrow('Failed to delete inspection');
    });
  });
});