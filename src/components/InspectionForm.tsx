import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { X } from 'lucide-react';
import { Form } from './forms/Form';
import { FormField } from './forms/FormField';
import { FormSelect } from './forms/FormSelect';
import { FormCheckbox } from './forms/FormCheckbox';
import { FileUpload } from './FileUpload';
import InspectionItems from './InspectionItems';
import Button from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import type { InspectionFormData } from '../lib/validations';
import type { InspectionItem } from '../types/inspection';

interface InspectionFormProps {
  form: UseFormReturn<InspectionFormData>;
  onSubmit: (data: InspectionFormData, files?: File[]) => void;
  onCancel: () => void;
  isEdit?: boolean;
  clientOptions: { value: string; label: string }[];
}

export function InspectionForm({
  form,
  onSubmit,
  onCancel,
  isEdit = false,
  clientOptions,
}: InspectionFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const selectedClientId = form.watch('client_id');
  const items = form.watch('items') || [];

  const handleSubmit = (data: InspectionFormData) => {
    console.log('Form submit:', { data, selectedFiles });
    onSubmit(data, selectedFiles);
  };

  const handleAddItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue(
      'items',
      [
        ...currentItems,
        {
          item_type: 'Fire Extinguisher',
          floor: '',
          room: '',
          equipment_type: '2.5ABC',
          status: 'pass',
          notes: '',
        },
      ],
      { shouldValidate: true }
    );
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue(
      'items',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentItems?.filter((_: any, i: number) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleItemChange = (
    index: number,
    field: keyof InspectionItem,
    value: string
  ) => {
    const currentItems = form.getValues('items');
    const updatedItems = [...currentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    form.setValue('items', updatedItems, { shouldValidate: true });
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
        <FormSelect
          label='Client'
          name='client_id'
          options={clientOptions}
          required
        />

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
            Manual Inspection Files
          </label>
          <FileUpload
            onFileSelect={setSelectedFiles}
            multiple
            className='mb-2'
          />
          {selectedFiles.length > 0 && (
            <div className='space-y-2'>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center text-sm text-gray-600'
                >
                  <span className='truncate'>{file.name}</span>
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    className='ml-2'
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
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onItemChange={handleItemChange}
      />

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
