import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell } from 'lucide-react';
import Card from '../Card';
import { Form } from '../forms/Form';
import { FormCheckbox } from '../forms/FormCheckbox';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';
import { companySchema } from '../../lib/validations';
import type { CompanyFormData } from '../../lib/validations';

export function CompanyNotifications() {
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      notifications: companyInfo.data?.notifications || {
        renewals: false,
        inspections: false,
        failures: false,
        users: false,
      },
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!companyInfo.data) return;

    await updateCompanyInfo.mutateAsync({
      ...companyInfo.data,
      notifications: data.notifications,
    });
  };

  return (
    <Card title='Notification Settings'>
      <Form form={form} onSubmit={onSubmit} className='space-y-4'>
        <div className='flex items-center space-x-2 text-gray-500 mb-4'>
          <Bell className='w-5 h-5' />
          <span className='text-sm'>Email Notifications</span>
        </div>

        <FormCheckbox label='Contract renewals' name='notifications.renewals' />

        <FormCheckbox
          label='Upcoming inspections'
          name='notifications.inspections'
        />

        <FormCheckbox
          label='Failed inspections'
          name='notifications.failures'
        />

        <FormCheckbox
          label='New user registrations'
          name='notifications.users'
        />
      </Form>
    </Card>
  );
}
