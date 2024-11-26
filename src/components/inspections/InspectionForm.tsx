import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { X, Copy } from 'lucide-react';
import { Form } from '../forms/Form';
import { FormField } from '../forms/FormField';
import { FormSelect } from '../forms/FormSelect';
import { FormCheckbox } from '../forms/FormCheckbox';
import { FileUpload } from '../FileUpload';
import InspectionItems from './InspectionItems';
import PreviousInspectionSelect from './PreviousInspectionSelect';
import Button from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import type { InspectionFormData } from '../../types/inspection';

interface InspectionFormProps {
  form: UseFormReturn<InspectionFormData>;
  onSubmit: (data: InspectionFormData, files?: File[]) => void;
  onCancel: () => void;
  clientOptions: { value: string; label: string }[];
  isEdit?: boolean;
}

export function InspectionForm({
  form,
  onSubmit,
  onCancel,
  clientOptions,
  isEdit = false,
}: InspectionFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPreviousInspections, setShowPreviousInspections] = useState(false);
  const selectedClientId = form.watch('client_id');
  const items = form.watch('items') || [];

  const handleSubmit = (data: InspectionFormData) => {
    onSubmit(data, selectedFiles);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePreviousInspectionSelect = (items: any[]) => {
    form.setValue('items', items, { shouldValidate: true });
    setShowPreviousInspections(false);
  };

  return (
    <Form form={form} onSubmit={handleSubmit} className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium'>
          {isEdit ? 'Edit Inspection' : 'New Inspection'}
        </h3>
        <Button variant='secondary' size='sm' onClick={onCancel}>
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='col-span-2 space-y-2'>
          <FormSelect
            label='Client'
            name='client_id'
            options={clientOptions}
            required
          />
          {selectedClientId && !isEdit && (
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={() => setShowPreviousInspections(true)}
              className='flex items-center'
            >
              <Copy className='w-4 h-4 mr-2' />
              Copy from Previous Inspection
            </Button>
          )}
        </div>

        <FormField
          label='Inspection Date'
          name='inspection_date'
          type='date'
          required
        />

        <FormField label='Location' name='location' required />

        <FormField label='Inspector' name='inspector' required />

        <FormSelect
          label='Status'
          name='status'
          options={[
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'completed', label: 'Completed' },
            { value: 'failed', label: 'Failed' },
          ]}
          required
        />

        <div className='col-span-2'>
          <FormField label='Notes' name='notes' as='textarea' rows={3} />
        </div>

        <div className='col-span-2'>
          <FormCheckbox label='Include cover page in PDF' name='cover_page' />
        </div>

        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Inspection Files
          </label>
          <FileUpload
            onFileSelect={setSelectedFiles}
            multiple
            accept='image/*,application/pdf'
            className='mb-2'
          />
          {selectedFiles.length > 0 && (
            <div className='space-y-2'>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded'
                >
                  <span className='truncate'>{file.name}</span>
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    onClick={() =>
                      setSelectedFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className='w-3 h-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InspectionItems
        items={items}
        onChange={(items) =>
          form.setValue('items', items, { shouldValidate: true })
        }
      />

      {showPreviousInspections && selectedClientId && (
        <PreviousInspectionSelect
          clientId={selectedClientId}
          onSelect={handlePreviousInspectionSelect}
          onClose={() => setShowPreviousInspections(false)}
        />
      )}

      <div className='flex justify-end space-x-2'>
        <Button type='button' variant='secondary' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <LoadingSpinner size='sm' className='mr-2' />
              {isEdit ? 'Updating...' : 'Saving...'}
            </>
          ) : isEdit ? (
            'Update Inspection'
          ) : (
            'Save Inspection'
          )}
        </Button>
      </div>
    </Form>
  );
}
