import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Download, Calendar, AlertTriangle } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import { generateRenewalPDF } from '../../utils/pdf';

export function UpcomingRenewals() {
  const nextMonth = addMonths(new Date(), 1);
  const monthStart = startOfMonth(nextMonth);
  const monthEnd = endOfMonth(nextMonth);

  const { data: renewals, isLoading } = useQuery({
    queryKey: ['upcoming-renewals', format(nextMonth, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .gte('contract_end', monthStart.toISOString())
        .lte('contract_end', monthEnd.toISOString())
        .order('contract_end');

      if (error) throw error;
      return data;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownloadPDF = async (client: any) => {
    await generateRenewalPDF({
      client,
      monthName: format(nextMonth, 'MMMM yyyy'),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <div className='flex justify-center items-center h-32'>
          <LoadingSpinner size='lg' />
        </div>
      </Card>
    );
  }

  if (!renewals?.length) {
    return (
      <Card>
        <div className='text-center py-6'>
          <Calendar className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900'>
            No Upcoming Renewals
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            No contracts are due for renewal in {format(nextMonth, 'MMMM yyyy')}
            .
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-medium text-gray-900'>
            Renewals for {format(nextMonth, 'MMMM yyyy')}
          </h2>
          <span className='text-sm text-gray-500'>
            {renewals.length} {renewals.length === 1 ? 'client' : 'clients'}
          </span>
        </div>

        <div className='divide-y divide-gray-200'>
          {renewals.map((client) => (
            <div key={client.id} className='py-4 space-y-2'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    {client.name}
                  </h3>
                  <div className='mt-1 text-sm text-gray-500'>
                    Contract ends:{' '}
                    {format(new Date(client.contract_end), 'MMM d, yyyy')}
                  </div>
                  {client.point_of_contact && (
                    <div className='mt-1 text-sm text-gray-500'>
                      Contact: {client.point_of_contact}
                    </div>
                  )}
                </div>
                <div className='flex items-start space-x-4'>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-gray-900'>
                      {formatCurrency(client.contract_amount || 0)}
                    </div>
                    <div className='mt-1 text-sm text-gray-500'>
                      {client.inspection_types} -{' '}
                      {client.frequency || 'Not specified'}
                    </div>
                  </div>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleDownloadPDF(client)}
                  >
                    <Download className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {client.notes && (
                <div className='flex items-center mt-2 text-sm text-yellow-600'>
                  <AlertTriangle className='w-4 h-4 mr-1' />
                  {client.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
