import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Form } from '../forms/Form';
import { FormField } from '../forms/FormField';
import { FormSelect } from '../forms/FormSelect';
import { FormCheckbox } from '../forms/FormCheckbox';
import Button from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { useUsers } from '../../hooks/useUsers';
import { userSchema } from '../../lib/validations';
import type { UserFormData } from '../../lib/validations';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UserFormProps {
  user?: any;
  onCancel: () => void;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function UserForm({ user, onCancel }: UserFormProps) {
  const { createUser, updateUser } = useUsers();
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      email: '',
      role: 'tech',
      phone_number: '',
      notify_renewals: false,
      notify_inspections: false,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    if (isEdit) {
      await updateUser.mutateAsync({
        id: user.user_id,
        data,
      });
    } else {
      await createUser.mutateAsync(data);
    }
    onCancel();
  };

  return (
    <Form form={form} onSubmit={onSubmit} className='space-y-4'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-medium'>
          {isEdit ? 'Edit User' : 'Add New User'}
        </h3>
        <Button variant='secondary' size='sm' onClick={onCancel}>
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          label='Email'
          name='email'
          type='email'
          required
          disabled={isEdit}
        />

        <FormSelect
          label='Role'
          name='role'
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'tech', label: 'Technician' },
          ]}
          required
        />

        <FormField label='Phone Number' name='phone_number' type='tel' />
      </div>

      <div className='space-y-2'>
        <FormCheckbox
          label='Notify about contract renewals'
          name='notify_renewals'
        />
        <FormCheckbox
          label='Notify about upcoming inspections'
          name='notify_inspections'
        />
      </div>

      <div className='flex justify-end space-x-2'>
        <Button type='button' variant='secondary' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <LoadingSpinner size='sm' className='mr-2' />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : isEdit ? (
            'Update User'
          ) : (
            'Create User'
          )}
        </Button>
      </div>
    </Form>
  );
}
