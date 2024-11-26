import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInspections } from '../../hooks/useInspections';
import { api } from '../../lib/api';
import type { Inspection, InspectionItem } from '../../types/inspection';

// Mock the API module
vi.mock('../../lib/api', () => ({
  api: {
    inspections: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      uploadFiles: vi.fn(),
    },
  },
}));

// Mock react-query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});

describe('useInspections', () => {
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

  describe('createInspection', () => {
    it('should create inspection successfully', async () => {
      (api.inspections.create as any).mockResolvedValue(mockInspection);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        await result.current.createInspection.mutateAsync({
          inspection: mockInspection,
          items: mockItems,
        });
      });

      expect(api.inspections.create).toHaveBeenCalledWith(mockInspection, mockItems);
    });

    it('should handle file uploads during creation', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      (api.inspections.create as any).mockResolvedValue(mockInspection);
      (api.inspections.uploadFiles as any).mockResolvedValue(['test.pdf']);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        await result.current.createInspection.mutateAsync({
          inspection: mockInspection,
          items: mockItems,
          files: [mockFile],
        });
      });

      expect(api.inspections.uploadFiles).toHaveBeenCalled();
    });
  });

  describe('updateInspection', () => {
    it('should update inspection successfully', async () => {
      (api.inspections.update as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        await result.current.updateInspection.mutateAsync({
          id: '123',
          inspection: mockInspection,
          items: mockItems,
        });
      });

      expect(api.inspections.update).toHaveBeenCalledWith('123', mockInspection, mockItems);
    });

    it('should handle errors during update', async () => {
      const mockError = new Error('Update failed');
      (api.inspections.update as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        try {
          await result.current.updateInspection.mutateAsync({
            id: '123',
            inspection: mockInspection,
          });
        } catch (error) {
          expect(error).toEqual(mockError);
        }
      });
    });
  });

  describe('deleteInspection', () => {
    it('should delete inspection successfully', async () => {
      (api.inspections.delete as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        await result.current.deleteInspection.mutateAsync('123');
      });

      expect(api.inspections.delete).toHaveBeenCalledWith('123');
    });

    it('should handle errors during deletion', async () => {
      const mockError = new Error('Delete failed');
      (api.inspections.delete as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInspections());

      await act(async () => {
        try {
          await result.current.deleteInspection.mutateAsync('123');
        } catch (error) {
          expect(error).toEqual(mockError);
        }
      });
    });
  });
});