import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { InspectionForm } from '../components/inspections/InspectionForm';
import { InspectionList } from '../components/inspections/InspectionList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useInspections } from '../hooks/useInspections';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { useClients } from '../hooks/useClients';
import { inspectionSchema } from '../lib/validations';
import type { InspectionFormData } from '../types/inspection';
import type { BasicCompanyInfo } from '../types/companyInfo';

function Inspections() {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [showNewInspectionForm, setShowNewInspectionForm] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const [inspectionToDelete, setInspectionToDelete] = useState<string | null>(
    null
  );
  const [basicCompanyInfo, setBasicCompanyInfo] = useState<
    BasicCompanyInfo | undefined
  >(undefined);
  const { companyInfo } = useCompanyInfo();

  useEffect(() => {
    if (companyInfo.data) {
      setBasicCompanyInfo(companyInfo.data);
    }
  }, [companyInfo.data]);

  const { inspections, createInspection, updateInspection, deleteInspection } =
    useInspections();
  const { clients } = useClients();

  const newInspectionForm = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      client_id: '',
      inspection_date: new Date().toISOString().split('T')[0],
      location: '',
      inspector: '',
      status: 'scheduled',
      notes: '',
      cover_page: true,
      items: [
        {
          item_type: 'Fire Extinguisher',
          floor: '',
          room: '',
          equipment_type: '2.5ABC',
          status: 'pass',
          notes: '',
        },
      ],
    },
  });

  const editInspectionForm = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: selectedInspection,
  });

  const handleCreateInspection = async (
    data: InspectionFormData,
    files?: File[]
  ) => {
    try {
      await createInspection.mutateAsync({
        inspection: {
          client_id: data.client_id,
          inspection_date: data.inspection_date,
          location: data.location,
          inspector: data.inspector,
          status: data.status,
          notes: data.notes || '',
          cover_page: data.cover_page,
        },
        items: data.items,
        files,
      });
      setShowNewInspectionForm(false);
      newInspectionForm.reset();
    } catch (error) {
      console.error('Error creating inspection:', error);
    }
  };

  const handleUpdateInspection = async (
    data: InspectionFormData,
    files?: File[]
  ) => {
    if (!selectedInspection) return;
    try {
      await updateInspection.mutateAsync({
        id: selectedInspection.id,
        inspection: {
          client_id: data.client_id,
          inspection_date: data.inspection_date,
          location: data.location,
          inspector: data.inspector,
          status: data.status,
          notes: data.notes || '',
          cover_page: data.cover_page,
        },
        items: data.items,
        files,
      });
      setSelectedInspection(null);
    } catch (error) {
      console.error('Error updating inspection:', error);
    }
  };

  const handleDeleteInspection = async () => {
    if (!inspectionToDelete) return;
    try {
      await deleteInspection.mutateAsync(inspectionToDelete);
      setInspectionToDelete(null);
    } catch (error) {
      console.error('Error deleting inspection:', error);
    }
  };

  if (inspections.isLoading || clients.isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (inspections.isError || clients.isError) {
    return (
      <EmptyState
        title='Error loading data'
        description='There was a problem loading the inspection data. Please try again.'
        action={{
          label: 'Retry',
          onClick: () => {
            inspections.refetch();
            clients.refetch();
          },
        }}
      />
    );
  }

  const clientOptions =
    clients.data?.map((client) => ({
      value: client.id,
      label: client.name,
    })) || [];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Inspections</h1>
        <Button
          onClick={() => setShowNewInspectionForm(true)}
          className='flex items-center'
        >
          <Plus className='w-4 h-4 mr-2' />
          New Inspection
        </Button>
      </div>

      {showNewInspectionForm && (
        <Card>
          <InspectionForm
            form={newInspectionForm}
            onSubmit={handleCreateInspection}
            onCancel={() => setShowNewInspectionForm(false)}
            clientOptions={clientOptions}
          />
        </Card>
      )}

      {selectedInspection && (
        <Card>
          <InspectionForm
            form={editInspectionForm}
            onSubmit={handleUpdateInspection}
            onCancel={() => setSelectedInspection(null)}
            clientOptions={clientOptions}
            isEdit
          />
        </Card>
      )}

      <Card>
        <InspectionList
          companyInfo={basicCompanyInfo}
          inspections={inspections.data || []}
          onEdit={(inspection) => {
            editInspectionForm.reset({
              ...inspection,
              items: inspection.inspection_items,
            });
            setSelectedInspection(inspection);
          }}
          onDelete={(id) => setInspectionToDelete(id)}
        />
      </Card>

      <ConfirmDialog
        isOpen={!!inspectionToDelete}
        title='Delete Inspection'
        message='Are you sure you want to delete this inspection? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDeleteInspection}
        onCancel={() => setInspectionToDelete(null)}
      />
    </div>
  );
}

export default Inspections;
