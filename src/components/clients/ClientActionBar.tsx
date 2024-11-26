import { Calendar, FileText, AlertTriangle, Clock } from 'lucide-react';
import Button from '../Button';
import { formatCurrency } from '../../utils/format';
import { format, isBefore, addDays } from 'date-fns';

interface ClientActionBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  onEdit: () => void;
  onClose: () => void;
}

export function ClientActionBar({
  client,
  onEdit,
  onClose,
}: ClientActionBarProps) {
  const getRenewalStatus = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const warningDate = addDays(today, 30);

    if (isBefore(end, today)) {
      return { status: 'Expired', color: 'text-red-600', icon: AlertTriangle };
    }
    if (isBefore(end, warningDate)) {
      return { status: 'Expiring Soon', color: 'text-yellow-600', icon: Clock };
    }
    return { status: 'Active', color: 'text-green-600', icon: null };
  };

  const {
    status,
    color,
    icon: StatusIcon,
  } = getRenewalStatus(client.contract_end);

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-8'>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                {client.name}
              </h3>
              <div className={`flex items-center ${color} text-sm mt-1`}>
                {StatusIcon && <StatusIcon className='w-4 h-4 mr-1' />}
                <span>{status}</span>
              </div>
            </div>

            <div className='flex items-center space-x-6'>
              <div className='flex items-center text-gray-500'>
                <Calendar className='w-4 h-4 mr-2' />
                <div className='text-sm'>
                  <div>
                    Contract: {formatCurrency(client.contract_amount || 0)}
                  </div>
                  <div>
                    {format(new Date(client.contract_start), 'MM/dd/yyyy')} -{' '}
                    {format(new Date(client.contract_end), 'MM/dd/yyyy')}
                  </div>
                </div>
              </div>

              {client.inspection_types?.length > 0 && (
                <div className='flex items-center text-gray-500'>
                  <FileText className='w-4 h-4 mr-2' />
                  <span className='text-sm'>
                    Services: {client.inspection_types.join(', ')}
                  </span>
                </div>
              )}

              {client.notes && (
                <div className='flex items-center text-gray-500'>
                  <FileText className='w-4 h-4 mr-2' />
                  <span className='text-sm max-w-xl truncate'>
                    {client.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Button variant='secondary' onClick={onEdit}>
              Edit Client
            </Button>
            <Button variant='secondary' onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
