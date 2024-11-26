import { UseFormReturn } from 'react-hook-form';
import { X } from 'lucide-react';
import { Form } from '../forms/Form';
import { FormField } from '../forms/FormField';
import { FormSelect } from '../forms/FormSelect';
import Button from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import type { ClientFormData } from '../../types/client';

interface ClientFormProps {
  form: UseFormReturn<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const inspectionTypeOptions = [
  { value: 'FE', label: 'Fire Extinguisher' },
  { value: 'FS', label: 'Fire Suppression' },
  { value: 'FA', label: 'Fire Alarm' },
  { value: 'EL', label: 'Emergency Lighting' },
  { value: 'SP', label: 'Sprinkler System' },
];

const frequencyOptions = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annual', label: 'Semi-Annual' },
  { value: 'Annual', label: 'Annual' },
];

export function ClientForm({
  form,
  onSubmit,
  onCancel,
  isEdit = false,
}: ClientFormProps) {
  const inspectionTypes = form.watch('inspection_types') || [];

  const handleInspectionTypeToggle = (type: string) => {
    const currentTypes = form.getValues('inspection_types') || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    form.setValue('inspection_types', newTypes, { shouldValidate: true });
  };

  return (
    <Form form={form} onSubmit={onSubmit} className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium'>
          {isEdit ? 'Edit Client' : 'Add New Client'}
        </h3>
        <Button variant='secondary' size='sm' onClick={onCancel}>
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField label='Company Name' name='name' required />
        <FormField label='Point of Contact' name='point_of_contact' />

        <div className='col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Inspection Types
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {inspectionTypeOptions.map((option) => (
              <div key={option.value} className='flex items-center'>
                <input
                  type='checkbox'
                  id={`inspection-type-${option.value}`}
                  checked={inspectionTypes.includes(option.value)}
                  onChange={() => handleInspectionTypeToggle(option.value)}
                  className='h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500'
                />
                <label
                  htmlFor={`inspection-type-${option.value}`}
                  className='ml-2 text-sm text-gray-700'
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <FormSelect
          label='Frequency'
          name='frequency'
          options={frequencyOptions}
        />

        <FormField label='Phone' name='phone' />
        <FormField label='Email' name='email' />

        <div className='md:col-span-2'>
          <FormField label='Street Address' name='street_address' />
        </div>

        <FormField label='City' name='city' />
        <div className='grid grid-cols-2 gap-4'>
          <FormField label='State' name='state' />
          <FormField label='ZIP Code' name='zip_code' />
        </div>

        <FormField
          label='Contract Amount'
          name='contract_amount'
          type='number'
          step='0.01'
        />

        <FormField label='Contract Start' name='contract_start' type='date' />
        <FormField label='Contract End' name='contract_end' type='date' />

        <div className='md:col-span-2'>
          <FormField label='Notes' name='notes' as='textarea' rows={3} />
        </div>
      </div>

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
            'Update Client'
          ) : (
            'Save Client'
          )}
        </Button>
      </div>
    </Form>
  );
}
