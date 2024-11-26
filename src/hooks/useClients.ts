import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { ClientFormData } from '../types/client';

export function useClients() {
  const queryClient = useQueryClient();

  const clients = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching clients:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Client fetch error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createClient = useMutation({
    mutationFn: async (client: ClientFormData) => {
      try {
        // Clean up the data before sending to Supabase
        const cleanedData = {
          ...client,
          email: client.email || null,
          contract_amount: client.contract_amount ? Number(client.contract_amount) : null,
        };

        const { data, error } = await supabase
          .from('clients')
          .insert([cleanedData])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating client:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create client');
      console.error('Error creating client:', error);
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      try {
        // Clean up the data before sending to Supabase
        const cleanedData = {
          ...data,
          email: data.email || null,
          contract_amount: data.contract_amount ? Number(data.contract_amount) : null,
        };

        const { error } = await supabase
          .from('clients')
          .update(cleanedData)
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating client:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update client');
      console.error('Error updating client:', error);
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete client');
      console.error('Error deleting client:', error);
    },
  });

  return {
    clients,
    createClient,
    updateClient,
    deleteClient,
  };
}