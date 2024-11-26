import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  History,
  Clock,
} from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import Card from '../components/Card';
import Button from '../components/Button';
import { ClientForm } from '../components/clients/ClientForm';
import { ClientActionBar } from '../components/clients/ClientActionBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { useClients } from '../hooks/useClients';
import { clientSchema, type ClientFormData } from '../types/client';
import { formatCurrency, formatPhoneNumber } from '../utils/format';

/* eslint-disable @typescript-eslint/no-explicit-any */
function Clients() {
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'expiring' | 'expired'
  >('all');
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  const { clients, createClient, updateClient, deleteClient } = useClients();

  const newClientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      point_of_contact: '',
      inspection_types: [],
      frequency: '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      email: '',
      notes: '',
      contract_start: format(new Date(), 'yyyy-MM-dd'),
      contract_end: format(new Date(), 'yyyy-MM-dd'),
      contract_amount: 0,
    },
  });

  const editClientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: selectedClient,
  });

  const handleCreateClient = async (data: ClientFormData) => {
    await createClient.mutateAsync(data);
    setShowNewClientForm(false);
    newClientForm.reset();
  };

  const handleUpdateClient = async (data: ClientFormData) => {
    if (!selectedClient) return;
    await updateClient.mutateAsync({
      id: selectedClient.id,
      data: data,
    });
    setSelectedClient(null);
    setShowActionBar(false);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    await deleteClient.mutateAsync(clientToDelete);
    setClientToDelete(null);
    setShowActionBar(false);
  };

  const handleRowClick = (client: any) => {
    setSelectedClient(client);
    setShowActionBar(true);
  };

  const getRenewalStatus = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const warningDate = addDays(today, 30);

    if (isBefore(end, today)) {
      return { status: 'expired', color: 'text-red-600', icon: AlertTriangle };
    }
    if (isBefore(end, warningDate)) {
      return { status: 'expiring', color: 'text-yellow-600', icon: Clock };
    }
    return { status: 'active', color: 'text-green-600', icon: null };
  };

  const filteredClients = React.useMemo(() => {
    if (!clients.data) return [];

    return clients.data.filter((client) => {
      const { status } = getRenewalStatus(client.contract_end);
      if (statusFilter === 'all') return true;
      return status === statusFilter;
    });
  }, [clients.data, statusFilter]);

  const statusCounts = React.useMemo(() => {
    if (!clients.data) return { all: 0, active: 0, expiring: 0, expired: 0 };

    return clients.data.reduce(
      (acc, client) => {
        const { status } = getRenewalStatus(client.contract_end);
        acc.all++;
        acc[status as keyof typeof acc]++;
        return acc;
      },
      { all: 0, active: 0, expiring: 0, expired: 0 }
    );
  }, [clients.data]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'contact',
      label: 'Contact',
      sortable: true,
      render: (client: any) => (
        <div>
          <div className='text-sm font-medium text-gray-900'>
            {client.point_of_contact || '-'}
          </div>
          {client.email && (
            <div className='text-sm text-gray-500'>{client.email}</div>
          )}
          <div className='text-sm text-gray-500'>
            {client.phone ? formatPhoneNumber(client.phone) : '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (client: any) => (
        <div className='text-sm text-gray-900'>
          {client.street_address ? (
            <>
              {client.street_address}
              <br />
              {client.city}, {client.state} {client.zip_code}
            </>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (client: any) => (
        <div className='text-sm text-gray-900 max-w-xs truncate'>
          {client.notes || '-'}
        </div>
      ),
    },
    {
      key: 'contract',
      label: 'Contract',
      sortable: true,
      render: (client: any) => {
        const {
          status,
          color,
          icon: StatusIcon,
        } = getRenewalStatus(client.contract_end);
        return (
          <div className='text-sm'>
            <div className='font-medium text-gray-900'>
              {client.contract_amount
                ? formatCurrency(client.contract_amount)
                : '-'}
            </div>
            <div className={`flex items-center ${color}`}>
              {StatusIcon && <StatusIcon className='w-4 h-4 mr-1' />}
              <span>
                {format(new Date(client.contract_start), 'MM/dd/yyyy')} -{' '}
                {format(new Date(client.contract_end), 'MM/dd/yyyy')}
              </span>
            </div>
            <div className={`text-sm ${color} capitalize`}>{status}</div>
          </div>
        );
      },
    },
  ];

  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (clients.isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (clients.isError) {
    return (
      <EmptyState
        title='Error loading clients'
        description='There was a problem loading the client list. Please try again.'
        action={{
          label: 'Retry',
          onClick: () => clients.refetch(),
        }}
      />
    );
  }

  return (
    <div className='space-y-6 pb-20'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Clients</h1>
        <Button
          onClick={() => setShowNewClientForm(true)}
          className='flex items-center'
        >
          <Plus className='w-4 h-4 mr-2' />
          New Client
        </Button>
      </div>

      {showNewClientForm && (
        <Card>
          <ClientForm
            form={newClientForm}
            onSubmit={handleCreateClient}
            onCancel={() => setShowNewClientForm(false)}
          />
        </Card>
      )}

      {selectedClient && !showActionBar && (
        <Card>
          <ClientForm
            form={editClientForm}
            onSubmit={handleUpdateClient}
            onCancel={() => setSelectedClient(null)}
            isEdit
          />
        </Card>
      )}

      <Card>
        <div className='mb-4 flex flex-wrap gap-2'>
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            size='sm'
            onClick={() => setStatusFilter('all')}
            className='flex items-center'
          >
            All
            <span className='ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs'>
              {statusCounts.all}
            </span>
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'primary' : 'secondary'}
            size='sm'
            onClick={() => setStatusFilter('active')}
            className='flex items-center'
          >
            Active
            <span className='ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs'>
              {statusCounts.active}
            </span>
          </Button>
          <Button
            variant={statusFilter === 'expiring' ? 'primary' : 'secondary'}
            size='sm'
            onClick={() => setStatusFilter('expiring')}
            className='flex items-center'
          >
            Expiring Soon
            <span className='ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs'>
              {statusCounts.expiring}
            </span>
          </Button>
          <Button
            variant={statusFilter === 'expired' ? 'primary' : 'secondary'}
            size='sm'
            onClick={() => setStatusFilter('expired')}
            className='flex items-center'
          >
            Expired
            <span className='ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs'>
              {statusCounts.expired}
            </span>
          </Button>
        </div>

        {!clients.data || filteredClients.length === 0 ? (
          <EmptyState
            title='No clients found'
            description={
              statusFilter === 'all'
                ? 'Get started by adding your first client.'
                : `No ${statusFilter} clients found.`
            }
            action={
              statusFilter === 'all'
                ? {
                    label: 'Add Client',
                    onClick: () => setShowNewClientForm(true),
                  }
                : undefined
            }
          />
        ) : (
          <DataTable
            data={filteredClients}
            columns={columns}
            searchKeys={['name', 'point_of_contact', 'email', 'phone', 'notes']}
            onRowClick={handleRowClick}
            actions={(client) => (
              <>
                <Button
                  variant='secondary'
                  size='sm'
                  className='mr-2'
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClient(client);
                    setShowHistory(true);
                  }}
                >
                  <History className='w-4 h-4' />
                </Button>
                <Button
                  variant='secondary'
                  size='sm'
                  className='mr-2'
                  onClick={(e) => {
                    e.stopPropagation();
                    editClientForm.reset({
                      ...client,
                      contract_amount: Number(client.contract_amount),
                    });
                    setSelectedClient(client);
                  }}
                >
                  <Edit2 className='w-4 h-4' />
                </Button>
                <Button
                  variant='danger'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    setClientToDelete(client.id);
                  }}
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </>
            )}
          />
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!clientToDelete}
        title='Delete Client'
        message='Are you sure you want to delete this client? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDeleteClient}
        onCancel={() => setClientToDelete(null)}
      />

      {showHistory && selectedClient && (
        <Card title={`History - ${selectedClient.name}`}>
          <div className='space-y-4'>
            <div className='flex justify-end'>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setShowHistory(false)}
              >
                Close
              </Button>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium'>Contract History</h3>
              <div className='text-sm text-gray-600'>
                Current Contract:{' '}
                {formatCurrency(selectedClient.contract_amount)} (
                {format(new Date(selectedClient.contract_start), 'MM/dd/yyyy')}{' '}
                - {format(new Date(selectedClient.contract_end), 'MM/dd/yyyy')})
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='font-medium'>Notes</h3>
              <div className='text-sm text-gray-600'>
                {selectedClient.notes || 'No notes available'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {showActionBar && selectedClient && (
        <ClientActionBar
          client={selectedClient}
          onEdit={() => {
            editClientForm.reset({
              ...selectedClient,
              contract_amount: Number(selectedClient.contract_amount),
            });
            setShowActionBar(false);
          }}
          onClose={() => {
            setSelectedClient(null);
            setShowActionBar(false);
          }}
        />
      )}
    </div>
  );
}

export default Clients;
