import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import Button from '../Button';
import { Copy, AlertCircle } from 'lucide-react';
import type { InspectionItem } from '../../types/inspection';

interface PreviousInspectionSelectProps {
  clientId: string;
  onSelect: (items: InspectionItem[]) => void;
  onClose: () => void;
}

export default function PreviousInspectionSelect({
  clientId,
  onSelect,
  onClose,
}: PreviousInspectionSelectProps) {
  const { data: previousInspections, isLoading } = useQuery({
    queryKey: ['previous-inspections', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(
          `
          id,
          inspection_date,
          location,
          inspector,
          inspection_items (*)
        `
        )
        .eq('client_id', clientId)
        .order('inspection_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <div className='p-4 text-center text-gray-500'>
        Loading previous inspections...
      </div>
    );
  }

  if (!previousInspections?.length) {
    return (
      <div className='p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center justify-center text-gray-500 mb-3'>
          <AlertCircle className='w-5 h-5 mr-2' />
          <span>No previous inspections found for this client</span>
        </div>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={onClose}
          className='w-full'
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h4 className='text-sm font-medium text-gray-900'>
          Previous Inspections
        </h4>
        <Button type='button' variant='secondary' size='sm' onClick={onClose}>
          Close
        </Button>
      </div>
      <div className='space-y-2'>
        {previousInspections.map((inspection) => (
          <div
            key={inspection.id}
            className='flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors'
          >
            <div className='text-sm'>
              <div className='font-medium'>
                {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
              </div>
              <div className='text-gray-500'>
                {inspection.location} - {inspection.inspector}
              </div>
              <div className='text-gray-500'>
                {inspection.inspection_items?.length || 0} items
              </div>
            </div>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={() => {
                onSelect(inspection.inspection_items);
                onClose();
              }}
            >
              <Copy className='w-4 h-4 mr-2' />
              Use This Report
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
