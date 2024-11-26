import { supabase } from './supabase';
import type { Inspection, InspectionItem } from '../types/inspection';
import type { Client } from '../types/client';

/**
 * Custom error class for API errors
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Centralized error handler for API calls
 */
const handleError = (error: any, context: string): never => {
  console.error(`API Error in ${context}:`, error);
  throw new APIError(
    `Failed to ${context}: ${error.message || 'Unknown error'}`,
    error.status || 500,
    error
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const api = {
  clients: {
    list: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');

        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error, 'fetch clients');
      }
    },

    create: async (client: Omit<Client, 'id'>) => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert([client])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error, 'create client');
      }
    },

    update: async (id: string, client: Partial<Client>) => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .update(client)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        handleError(error, 'update client');
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);

        if (error) throw error;
      } catch (error) {
        handleError(error, 'delete client');
      }
    },
  },

  inspections: {
    list: async () => {
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
        return data;
      } catch (error) {
        handleError(error, 'fetch inspections');
      }
    },

    create: async (
      inspection: Omit<Inspection, 'id'>,
      items: Omit<InspectionItem, 'id' | 'inspection_id'>[]
    ) => {
      try {
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .insert([inspection])
          .select()
          .single();

        if (inspectionError) throw inspectionError;

        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('inspection_items')
            .insert(
              items.map((item) => ({
                ...item,
                inspection_id: inspectionData.id,
                item_type: item.equipment_type,
              }))
            );

          if (itemsError) throw itemsError;
        }

        return inspectionData;
      } catch (error) {
        handleError(error, 'create inspection');
      }
    },

    update: async (
      id: string,
      inspection: Partial<Inspection>,
      items?: Omit<InspectionItem, 'id'>[]
    ) => {
      try {
        const { error: inspectionError } = await supabase
          .from('inspections')
          .update(inspection)
          .eq('id', id);

        if (inspectionError) throw inspectionError;

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
                  item_type: item.equipment_type,
                }))
              );

            if (itemsError) throw itemsError;
          }
        }
      } catch (error) {
        handleError(error, 'update inspection');
      }
    },

    delete: async (id: string) => {
      try {
        // Delete inspection (this will cascade delete items due to FK constraint)
        const { error } = await supabase
          .from('inspections')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        handleError(error, 'delete inspection');
      }
    },

    /**
     * Upload files associated with an inspection
     */
    uploadFiles: async (inspectionId: string, files: File[]) => {
      try {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${inspectionId}/${Date.now()}.${fileExt}`;

          const { error } = await supabase.storage
            .from('inspection-files')
            .upload(fileName, file);

          if (error) throw error;
          return fileName;
        });

        const fileNames = await Promise.all(uploadPromises);
        return fileNames;
      } catch (error) {
        handleError(error, 'upload inspection files');
      }
    },
  },
};
