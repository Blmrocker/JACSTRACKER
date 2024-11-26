import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import {
  Calendar,
  FileText,
  Clock,
  BarChart3,
  Download,
  Filter,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency } from '../utils/format';
import { generateInspectionPDF, generateRenewalPDF } from '../utils/pdf';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { BasicCompanyInfo } from '../types/companyInfo';

type TimeRange = '30' | '60' | '90' | 'all';
type ReportTab = 'overview' | 'inspections' | 'renewals' | 'audit';

function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [overviewRange, setOverviewRange] = useState<TimeRange>('30');
  const [inspectionRange, setInspectionRange] = useState<TimeRange>('30');
  const [renewalRange, setRenewalRange] = useState<TimeRange>('30');
  const [basicCompanyInfo, setBasicCompanyInfo] = useState<
    BasicCompanyInfo | undefined
  >(undefined);
  const { companyInfo } = useCompanyInfo();

  useEffect(() => {
    if (companyInfo.data) {
      setBasicCompanyInfo(companyInfo.data);
    }
  }, [companyInfo.data]);

  // Fetch stats for overview
  const stats = useQuery({
    queryKey: ['report-stats', overviewRange],
    queryFn: async () => {
      const endDate =
        overviewRange === 'all'
          ? addDays(new Date(), 365)
          : addDays(new Date(), parseInt(overviewRange));

      const { data: inspections } = await supabase
        .from('inspections')
        .select('status')
        .gte('inspection_date', new Date().toISOString())
        .lte('inspection_date', endDate.toISOString());

      const { data: renewals } = await supabase
        .from('clients')
        .select('contract_end, contract_amount')
        .gte('contract_end', new Date().toISOString())
        .lte('contract_end', endDate.toISOString());

      return {
        upcomingInspections: inspections?.length || 0,
        upcomingRenewals: renewals?.length || 0,
        renewalValue:
          renewals?.reduce(
            (sum, client) => sum + (client.contract_amount || 0),
            0
          ) || 0,
      };
    },
  });

  const inspections = useQuery({
    queryKey: ['upcoming-inspections', inspectionRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inspections')
        .select(
          `
          *,
          client:clients (
            name,
            contract_amount,
            notes,
            inspection_types
          )
        `
        )
        .gte('inspection_date', new Date().toISOString())
        .order('inspection_date');

      if (error) throw error;
      return data;
    },
  });

  const renewals = useQuery({
    queryKey: ['upcoming-renewals', renewalRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .gte('contract_end', new Date().toISOString())
        .order('contract_end');

      if (error) throw error;
      return data;
    },
  });

  const filterByRange = (date: string, range: TimeRange) => {
    const today = new Date();
    const futureDate = addDays(today, parseInt(range));
    const targetDate = new Date(date);

    if (range === 'all') return true;
    return isAfter(targetDate, today) && isBefore(targetDate, futureDate);
  };

  const filteredInspections = React.useMemo(() => {
    if (!inspections.data) return [];
    return inspections.data.filter((inspection) =>
      filterByRange(inspection.inspection_date, inspectionRange)
    );
  }, [inspections.data, inspectionRange]);

  const filteredRenewals = React.useMemo(() => {
    if (!renewals.data) return [];
    return renewals.data.filter((client) =>
      filterByRange(client.contract_end, renewalRange)
    );
  }, [renewals.data, renewalRange]);

  if (inspections.isLoading || renewals.isLoading || stats.isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  const TimeRangeSelector = ({
    value,
    onChange,
  }: {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
  }) => (
    <div className='flex items-center space-x-2'>
      <Filter className='w-4 h-4 text-gray-500' />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeRange)}
        className='rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm'
      >
        <option value='30'>Next 30 Days</option>
        <option value='60'>Next 60 Days</option>
        <option value='90'>Next 90 Days</option>
        <option value='all'>All Time</option>
      </select>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Reports</h1>
        <div className='flex space-x-2'>
          {['overview', 'inspections', 'renewals', 'audit'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab as ReportTab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className='flex justify-end'>
            <TimeRangeSelector
              value={overviewRange}
              onChange={setOverviewRange}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card>
              <div className='space-y-3'>
                <div className='flex items-center space-x-4'>
                  <div className='bg-blue-100 p-3 rounded-lg'>
                    <BarChart3 className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Upcoming Inspections
                    </div>
                    <div className='text-2xl font-bold'>
                      {stats.data?.upcomingInspections}
                    </div>
                  </div>
                </div>
                <p className='text-sm text-gray-600'>
                  Total number of inspections scheduled for the next{' '}
                  {overviewRange === 'all' ? 'year' : `${overviewRange} days`}.
                  This includes all types of inspections across all clients.
                </p>
              </div>
            </Card>

            <Card>
              <div className='space-y-3'>
                <div className='flex items-center space-x-4'>
                  <div className='bg-green-100 p-3 rounded-lg'>
                    <Users className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Upcoming Renewals
                    </div>
                    <div className='text-2xl font-bold'>
                      {stats.data?.upcomingRenewals}
                    </div>
                  </div>
                </div>
                <p className='text-sm text-gray-600'>
                  Number of client contracts due for renewal in the next{' '}
                  {overviewRange === 'all' ? 'year' : `${overviewRange} days`}.
                  Helps track and prepare for upcoming contract negotiations.
                </p>
              </div>
            </Card>

            <Card>
              <div className='space-y-3'>
                <div className='flex items-center space-x-4'>
                  <div className='bg-purple-100 p-3 rounded-lg'>
                    <FileText className='w-6 h-6 text-purple-600' />
                  </div>
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Renewal Value
                    </div>
                    <div className='text-2xl font-bold'>
                      {formatCurrency(stats.data?.renewalValue || 0)}
                    </div>
                  </div>
                </div>
                <p className='text-sm text-gray-600'>
                  Total contract value of all renewals due in the next{' '}
                  {overviewRange === 'all' ? 'year' : `${overviewRange} days`}.
                  Represents potential revenue from upcoming contract renewals.
                </p>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'inspections' && (
        <Card>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-medium'>Upcoming Inspections</h2>
              <TimeRangeSelector
                value={inspectionRange}
                onChange={setInspectionRange}
              />
            </div>

            {filteredInspections.length === 0 ? (
              <EmptyState
                title='No upcoming inspections'
                description={`No inspections scheduled in the next ${inspectionRange} days.`}
              />
            ) : (
              <div className='divide-y divide-gray-200'>
                {filteredInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className='py-4 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <Calendar className='w-5 h-5 text-gray-400' />
                        <div>
                          <h3 className='font-medium'>
                            {inspection.client?.name}
                          </h3>
                          <p className='text-sm text-gray-500'>
                            {format(
                              new Date(inspection.inspection_date),
                              'MMM d, yyyy'
                            )}
                          </p>
                          {inspection.client?.inspection_types?.length > 0 && (
                            <div className='text-sm text-gray-500'>
                              Types:{' '}
                              {inspection.client.inspection_types.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='text-right'>
                          <div className='font-medium'>
                            {formatCurrency(
                              inspection.client?.contract_amount || 0
                            )}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {inspection.location}
                          </div>
                        </div>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() =>
                            generateInspectionPDF({
                              inspection,
                              items: inspection.inspection_items || [],
                              clientName: inspection.client?.name || 'Unknown',
                              includeCoverPage: true,
                              companyInfo: basicCompanyInfo,
                            })
                          }
                        >
                          <Download className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'renewals' && (
        <Card>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-medium'>Upcoming Renewals</h2>
              <TimeRangeSelector
                value={renewalRange}
                onChange={setRenewalRange}
              />
            </div>

            {filteredRenewals.length === 0 ? (
              <EmptyState
                title='No upcoming renewals'
                description={`No contracts due for renewal in the next ${renewalRange} days.`}
              />
            ) : (
              <div className='divide-y divide-gray-200'>
                {filteredRenewals.map((client) => (
                  <div
                    key={client.id}
                    className='py-4 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <Clock className='w-5 h-5 text-gray-400' />
                        <div>
                          <h3 className='font-medium'>{client.name}</h3>
                          <p className='text-sm text-gray-500'>
                            Expires:{' '}
                            {format(
                              new Date(client.contract_end),
                              'MMM d, yyyy'
                            )}
                          </p>
                          {client.inspection_types?.length > 0 && (
                            <div className='text-sm text-gray-500'>
                              Types: {client.inspection_types.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='text-right'>
                          <div className='font-medium'>
                            {formatCurrency(client.contract_amount || 0)}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {client.frequency || 'Not specified'}
                          </div>
                        </div>
                        <Button
                          variant='secondary'
                          size='sm'
                          onClick={() =>
                            generateRenewalPDF({
                              client,
                              monthName: format(
                                new Date(client.contract_end),
                                'MMMM yyyy'
                              ),
                            })
                          }
                        >
                          <Download className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <div className='space-y-4'>
            <h2 className='text-lg font-medium'>Inspection Audit</h2>
            <p className='text-gray-500'>
              View detailed inspection history, pass/fail rates, and compliance
              metrics.
            </p>
            {/* Add audit content here */}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Reports;
