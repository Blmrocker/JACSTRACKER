import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { UpcomingRenewals } from '../components/dashboard/UpcomingRenewals';
import {
  // BarChart,
  CheckCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Percent,
  Clock,
} from 'lucide-react';

// interface DashboardStats {
//   totalClients: number;
//   upcomingInspections: number;
//   expiringContracts: number;
//   completedInspections: number;
//   activeInspectors: number;
//   passRate: number;
// }

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  textColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
  textColor?: string;
}) {
  return (
    <Card>
      <button
        onClick={onClick}
        className='w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg'
      >
        <div className='flex items-center space-x-3'>
          <Icon className={`w-8 h-8 ${color}`} />
          <div>
            <div className='text-sm font-medium text-gray-500'>{label}</div>
            <div className={`text-2xl font-bold ${textColor || ''}`}>
              {value}
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}

function Dashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Get total clients
      const { data: clients } = await supabase.from('clients').select('id');

      // Get upcoming inspections
      const { data: upcomingInspections } = await supabase
        .from('inspections')
        .select('id')
        .gte('inspection_date', new Date().toISOString())
        .lte('inspection_date', thirtyDaysFromNow.toISOString())
        .eq('status', 'scheduled');

      // Get expiring contracts
      const { data: expiringContracts } = await supabase
        .from('clients')
        .select('id')
        .lte('contract_end', thirtyDaysFromNow.toISOString())
        .gt('contract_end', new Date().toISOString());

      // Get completed inspections this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: completedInspections } = await supabase
        .from('inspections')
        .select('id')
        .eq('status', 'completed')
        .gte('inspection_date', startOfMonth.toISOString());

      // Get active inspectors
      const { data: inspectors } = await supabase
        .from('inspections')
        .select('inspector')
        .gte('inspection_date', startOfMonth.toISOString())
        .not('inspector', 'is', null);

      // Get pass rate
      const { data: inspectionItems } = await supabase
        .from('inspection_items')
        .select('status')
        .gte('created_at', startOfMonth.toISOString());

      const uniqueInspectors = new Set(
        inspectors?.map((i) => i.inspector) || []
      );
      const totalItems = inspectionItems?.length || 0;
      const passedItems =
        inspectionItems?.filter((i) => i.status === 'pass').length || 0;

      return {
        totalClients: clients?.length || 0,
        upcomingInspections: upcomingInspections?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
        completedInspections: completedInspections?.length || 0,
        activeInspectors: uniqueInspectors.size,
        passRate: totalItems ? Math.round((passedItems / totalItems) * 100) : 0,
      };
    },
  });

  if (statsLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (statsError) {
    return (
      <EmptyState
        title='Error loading dashboard'
        description='There was a problem loading the dashboard data. Please try again.'
        action={{
          label: 'Retry',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const currentStats = stats || {
    totalClients: 0,
    upcomingInspections: 0,
    expiringContracts: 0,
    completedInspections: 0,
    activeInspectors: 0,
    passRate: 0,
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {userRole === 'admin' && (
          <StatCard
            icon={Users}
            label='Total Clients'
            value={currentStats.totalClients}
            color='text-blue-500'
            onClick={() => navigate('/clients')}
          />
        )}

        <StatCard
          icon={Clock}
          label='Upcoming Inspections'
          value={currentStats.upcomingInspections}
          color='text-yellow-500'
          textColor='text-yellow-600'
          onClick={() =>
            navigate('/inspections', {
              state: { filter: 'upcoming' },
            })
          }
        />

        {userRole === 'admin' && (
          <StatCard
            icon={AlertTriangle}
            label='Contracts Expiring Soon'
            value={currentStats.expiringContracts}
            color='text-red-500'
            textColor='text-red-600'
            onClick={() =>
              navigate('/clients', {
                state: { filter: 'expiring' },
              })
            }
          />
        )}

        <StatCard
          icon={CheckCircle}
          label='Completed This Month'
          value={currentStats.completedInspections}
          color='text-green-500'
          textColor='text-green-600'
          onClick={() =>
            navigate('/inspections', {
              state: { filter: 'completed' },
            })
          }
        />

        <StatCard
          icon={UserCheck}
          label='Active Inspectors'
          value={currentStats.activeInspectors}
          color='text-indigo-500'
          onClick={() =>
            navigate('/users', {
              state: { filter: 'active' },
            })
          }
        />

        <StatCard
          icon={Percent}
          label='Pass Rate'
          value={`${currentStats.passRate}%`}
          color='text-teal-500'
          onClick={() => navigate('/reports')}
        />
      </div>

      {userRole === 'admin' && <UpcomingRenewals />}
    </div>
  );
}

export default Dashboard;
