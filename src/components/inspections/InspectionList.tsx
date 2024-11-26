import { memo } from 'react';
import { format } from 'date-fns';
import {
  Edit2,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { DataTable } from '../DataTable';
import Button from '../Button';
import { generateInspectionPDF } from '../../utils/pdf';
import type { Inspection } from '../../types/inspection';
import { BasicCompanyInfo } from '../../types/companyInfo';

interface InspectionListProps {
  inspections: Inspection[];
  companyInfo?: BasicCompanyInfo;
  onEdit: (inspection: Inspection) => void;
  onDelete: (id: string) => void;
}

const StatusIcon = memo(({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className='w-5 h-5 text-green-500 mr-2' />;
    case 'scheduled':
      return <Clock className='w-5 h-5 text-yellow-500 mr-2' />;
    case 'failed':
      return <AlertTriangle className='w-5 h-5 text-red-500 mr-2' />;
    default:
      return null;
  }
});

const InspectionActions = memo(
  ({
    inspection,
    onEdit,
    onDelete,
    companyInfo,
  }: {
    inspection: Inspection;
    companyInfo?: BasicCompanyInfo;
    onEdit: (inspection: Inspection) => void;
    onDelete: (id: string) => void;
  }) => {
    const handleDownloadPDF = async () => {
      try {
        await generateInspectionPDF({
          inspection,
          items: inspection.inspection_items || [],
          clientName: inspection.client?.name || 'Unknown Client',
          includeCoverPage: inspection.cover_page,
          companyInfo: companyInfo,
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };

    return (
      <>
        <Button
          variant='secondary'
          size='sm'
          className='mr-2'
          onClick={handleDownloadPDF}
        >
          <Download className='w-4 h-4' />
        </Button>
        <Button
          variant='secondary'
          size='sm'
          className='mr-2'
          onClick={() => onEdit(inspection)}
        >
          <Edit2 className='w-4 h-4' />
        </Button>
        <Button
          variant='danger'
          size='sm'
          onClick={() => onDelete(inspection.id!)}
        >
          <Trash2 className='w-4 h-4' />
        </Button>
      </>
    );
  }
);

export const InspectionList = memo(function InspectionList({
  inspections,
  onEdit,
  onDelete,
  companyInfo,
}: InspectionListProps) {
  const columns = [
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      render: (inspection: Inspection) => (
        <div>
          <div className='text-sm font-medium text-gray-900'>
            {inspection.client?.name}
          </div>
          {inspection.client?.inspection_types &&
            inspection.client.inspection_types.length > 0 && (
              <div className='text-xs text-gray-500'>
                {inspection.client.inspection_types.join(', ')}
              </div>
            )}
        </div>
      ),
    },
    {
      key: 'inspection_date',
      label: 'Date',
      sortable: true,
      render: (inspection: Inspection) => (
        <div className='text-sm text-gray-900'>
          {format(new Date(inspection.inspection_date), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'inspector',
      label: 'Inspector',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (inspection: Inspection) => (
        <div className='flex items-center'>
          <StatusIcon status={inspection.status} />
          <span className='text-sm text-gray-900 capitalize'>
            {inspection.status}
          </span>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (inspection: Inspection) => (
        <div className='text-sm text-gray-900'>
          {inspection.inspection_items?.length || 0} items
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={inspections}
      columns={columns}
      searchKeys={['client.name', 'location', 'inspector']}
      actions={(inspection) => (
        <InspectionActions
          inspection={inspection}
          companyInfo={companyInfo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
});
