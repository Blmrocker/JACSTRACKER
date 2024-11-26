import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Inspection, InspectionItem } from '../types/inspection';

interface UseInspectionsReturn {
  inspections: ReturnType<typeof useQuery<Inspection[], Error>>;
  createInspection: ReturnType<
    typeof useMutation<
      Inspection,
      Error,
      {
        inspection: Omit<Inspection, 'id'>;
        items: Omit<InspectionItem, 'id' | 'inspection_id'>[];
        files?: File[];
      }
    >
  >;
  updateInspection: ReturnType<
    typeof useMutation<
      void,
      Error,
      {
        id: string;
        inspection: Partial<Inspection>;
        items?: Omit<InspectionItem, 'id' | 'inspection_id'>[];
        files?: File[];
      }
    >
  >;
  deleteInspection: ReturnType<typeof useMutation<void, Error, string>>;
}

export function useInspections(): UseInspectionsReturn {
  const queryClient = useQueryClient();

  const inspections = useQuery({
    queryKey: ['inspections'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('inspections')
          .select(
            `
            *,
            client:clients (
              id,
              name,
              point_of_contact,
              inspection_types,
              frequency
            ),
            inspection_items (*)
          `
          )
          .order('inspection_date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching inspections:', error);
        throw new Error('Failed to fetch inspections');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createInspection = useMutation({
    mutationFn: async ({ inspection, items, files }) => {
      try {
        // First create the inspection
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .insert([inspection])
          .select()
          .single();

        if (inspectionError) throw inspectionError;
        if (!inspectionData) throw new Error('No inspection data returned');

        // Then create the inspection items
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('inspection_items')
            .insert(
              items.map((item) => ({
                ...item,
                inspection_id: inspectionData.id,
              }))
            );

          if (itemsError) throw itemsError;
        }

        // Handle file uploads if any
        if (files?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uploadPromises = files.map(async (file: any) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${inspectionData.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('inspection-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;
            return fileName;
          });

          await Promise.all(uploadPromises);
        }

        return inspectionData;
      } catch (error) {
        console.error('Error creating inspection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create inspection');
      console.error('Error creating inspection:', error);
    },
  });

  const updateInspection = useMutation({
    mutationFn: async ({ id, inspection, items, files }) => {
      try {
        // Update inspection
        const { error: inspectionError } = await supabase
          .from('inspections')
          .update(inspection)
          .eq('id', id);

        if (inspectionError) throw inspectionError;

        // Update items if provided
        if (items) {
          // Delete existing items
          const { error: deleteError } = await supabase
            .from('inspection_items')
            .delete()
            .eq('inspection_id', id);

          if (deleteError) throw deleteError;

          // Insert new items
          if (items.length > 0) {
            const { error: itemsError } = await supabase
              .from('inspection_items')
              .insert(
                items.map((item) => ({
                  ...item,
                  inspection_id: id,
                }))
              );

            if (itemsError) throw itemsError;
          }
        }

        // Handle new file uploads
        if (files?.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uploadPromises = files.map(async (file: any) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('inspection-files')
              .upload(fileName, file);

            if (uploadError) throw uploadError;
            return fileName;
          });

          await Promise.all(uploadPromises);
        }
      } catch (error) {
        console.error('Error updating inspection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update inspection');
      console.error('Error updating inspection:', error);
    },
  });

  const deleteInspection = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Delete inspection (this will cascade delete items due to FK constraint)
        const { error } = await supabase
          .from('inspections')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Delete associated files
        const { data: files } = await supabase.storage
          .from('inspection-files')
          .list(id);

        if (files?.length) {
          await supabase.storage
            .from('inspection-files')
            .remove(files.map((file) => `${id}/${file.name}`));
        }
      } catch (error) {
        console.error('Error deleting inspection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete inspection');
      console.error('Error deleting inspection:', error);
    },
  });

  return {
    inspections,
    createInspection,
    updateInspection,
    deleteInspection,
  };
}
