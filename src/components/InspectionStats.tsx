import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Card from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import {
  BarChart,
  CheckCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Percent,
} from 'lucide-react';

export function InspectionStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inspection-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(
          `
          inspection_date,
          status,
          client:clients (id),
          inspector,
          inspection_items (status)
        `
        )
        .gte(
          'inspection_date',
          new Date(new Date().getFullYear(), 0, 1).toISOString()
        );

      if (error) throw error;

      // Calculate statistics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monthlyStats = data.reduce((acc: any, inspection) => {
        const month = new Date(inspection.inspection_date).toLocaleString(
          'default',
          { month: 'long' }
        );

        if (!acc[month]) {
          acc[month] = {
            total: 0,
            completed: 0,
            failed: 0,
            clients: new Set(),
            inspectors: new Set(),
            items: {
              total: 0,
              passed: 0,
              failed: 0,
              noAccess: 0,
            },
          };
        }

        acc[month].total++;
        if (inspection.status === 'completed') acc[month].completed++;
        if (inspection.status === 'failed') acc[month].failed++;
        acc[month].clients.add(inspection.client.id);
        acc[month].inspectors.add(inspection.inspector);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inspection.inspection_items?.forEach((item: any) => {
          acc[month].items.total++;
          if (item.status === 'pass') acc[month].items.passed++;
          if (item.status === 'fail') acc[month].items.failed++;
          if (item.status === 'no-access') acc[month].items.noAccess++;
        });

        return acc;
      }, {});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return Object.entries(monthlyStats).map(
        ([month, stats]: [string, any]) => ({
          month,
          ...stats,
          clients: stats.clients.size,
          inspectors: stats.inspectors.size,
          passRate: stats.items.total
            ? ((stats.items.passed / stats.items.total) * 100).toFixed(1)
            : 0,
        })
      );
    },
  });

  if (isLoading) {
    return <LoadingSpinner size='lg' />;
  }

  if (error) {
    return (
      <div className='text-red-600'>Error loading inspection statistics</div>
    );
  }

  const currentMonth = stats?.[0] || {
    total: 0,
    completed: 0,
    failed: 0,
    clients: 0,
    inspectors: 0,
    passRate: 0,
  };

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
      <Card>
        <div className='flex items-center space-x-3'>
          <BarChart className='w-8 h-8 text-blue-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>
              Total Inspections
            </div>
            <div className='text-2xl font-bold'>{currentMonth.total}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className='flex items-center space-x-3'>
          <CheckCircle className='w-8 h-8 text-green-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>Completed</div>
            <div className='text-2xl font-bold text-green-600'>
              {currentMonth.completed}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className='flex items-center space-x-3'>
          <AlertTriangle className='w-8 h-8 text-red-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>Failed</div>
            <div className='text-2xl font-bold text-red-600'>
              {currentMonth.failed}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className='flex items-center space-x-3'>
          <Users className='w-8 h-8 text-purple-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>
              Unique Clients
            </div>
            <div className='text-2xl font-bold'>{currentMonth.clients}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className='flex items-center space-x-3'>
          <UserCheck className='w-8 h-8 text-indigo-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>
              Active Inspectors
            </div>
            <div className='text-2xl font-bold'>{currentMonth.inspectors}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className='flex items-center space-x-3'>
          <Percent className='w-8 h-8 text-teal-500' />
          <div>
            <div className='text-sm font-medium text-gray-500'>Pass Rate</div>
            <div className='text-2xl font-bold'>{currentMonth.passRate}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
