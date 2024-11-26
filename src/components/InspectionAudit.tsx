import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import Card from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { InspectionStats } from './InspectionStats';

export function InspectionAudit() {
  const {
    data: inspections,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inspection-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(
          `
          id,
          inspection_date,
          location,
          inspector,
          status,
          notes,
          cover_page,
          client:clients (
            name,
            point_of_contact,
            inspection_types,
            frequency
          ),
          inspection_items (
            id,
            item_type,
            floor,
            room,
            equipment_type,
            status,
            notes
          )
        `
        )
        .order('inspection_date', { ascending: false });

      if (error) throw error;

      return data.map((inspection) => ({
        ...inspection,
        client: Array.isArray(inspection.client)
          ? inspection.client[0]
          : inspection.client,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <Card title='Error'>
        <div className='text-red-600'>
          Failed to load inspection data: {(error as Error).message}
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'scheduled':
        return <Clock className='w-5 h-5 text-yellow-500' />;
      case 'failed':
        return <AlertTriangle className='w-5 h-5 text-red-500' />;
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <InspectionStats />

      <div className='space-y-4'>
        {inspections?.map((inspection) => (
          <Card key={inspection.id}>
            <div className='space-y-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-medium'>
                    {inspection.client?.name}
                  </h3>
                  <div className='text-sm text-gray-500'>
                    {format(
                      new Date(inspection.inspection_date),
                      'MMMM d, yyyy'
                    )}
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {getStatusIcon(inspection.status)}
                  <span className='capitalize'>{inspection.status}</span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <div className='font-medium'>Location</div>
                  <div>{inspection.location}</div>
                </div>
                <div>
                  <div className='font-medium'>Inspector</div>
                  <div>{inspection.inspector}</div>
                </div>
                <div>
                  <div className='font-medium'>Contact</div>
                  <div>{inspection.client?.point_of_contact || 'N/A'}</div>
                </div>
                <div>
                  <div className='font-medium'>Type & Frequency</div>
                  <div>
                    {inspection.client?.inspection_types || 'N/A'} -{' '}
                    {inspection.client?.frequency || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div className='font-medium mb-2'>Inspection Items</div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='grid grid-cols-4 gap-4 mb-2 text-sm font-medium text-gray-500'>
                    <div>Total</div>
                    <div>Passed</div>
                    <div>Failed</div>
                    <div>No Access</div>
                  </div>
                  <div className='grid grid-cols-4 gap-4 text-lg font-bold'>
                    <div>{inspection.inspection_items?.length || 0}</div>
                    <div className='text-green-600'>
                      {inspection.inspection_items?.filter(
                        (i) => i.status === 'pass'
                      ).length || 0}
                    </div>
                    <div className='text-red-600'>
                      {inspection.inspection_items?.filter(
                        (i) => i.status === 'fail'
                      ).length || 0}
                    </div>
                    <div className='text-yellow-600'>
                      {inspection.inspection_items?.filter(
                        (i) => i.status === 'no-access'
                      ).length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {inspection.notes && (
                <div>
                  <div className='font-medium'>Notes</div>
                  <div className='text-sm text-gray-600'>
                    {inspection.notes}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
