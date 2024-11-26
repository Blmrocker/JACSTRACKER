import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Upload } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { Form } from '../forms/Form';
import { FormField } from '../forms/FormField';
import { LoadingSpinner } from '../LoadingSpinner';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';
import { companySchema } from '../../lib/validations';
import type { CompanyFormData } from '../../lib/validations';

export function CompanyProfile() {
  // uncomment this and remove the code one line below when uploadLogo becomes active
  // and uncomment all code related to uploadLogo in whole component
  // const { companyInfo, updateCompanyInfo, uploadLogo } = useCompanyInfo();
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  const [previewUrl, setPreviewUrl] = React.useState<string>(
    companyInfo.data?.logo_url || ''
  );

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: companyInfo.data?.name || '',
      address: companyInfo.data?.address || '',
      phone: companyInfo.data?.phone || '',
      email: companyInfo.data?.email || '',
      website: companyInfo.data?.website || '',
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be less than 2MB');
      return;
    }

    // Check dimensions
    const img = new Image();
    img.onload = async () => {
      if (img.width > 400 || img.height > 400) {
        alert('Logo dimensions should not exceed 400x400 pixels');
        return;
      }

      try {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        // await uploadLogo.mutateAsync(file);
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    };

    // Load the image to check dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await updateCompanyInfo.mutateAsync(data);
    } catch (error) {
      console.error('Error updating company info:', error);
    }
  };

  return (
    <Card>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-medium text-gray-900'>
            Company Information
          </h2>
        </div>

        <div className='flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg'>
          <div className='relative'>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt='Company logo'
                className='w-40 h-40 object-contain bg-white border rounded-lg shadow-sm'
              />
            ) : (
              <div className='w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white'>
                <span className='text-gray-400'>No logo</span>
              </div>
            )}
            <div className='absolute bottom-2 right-2'>
              <label className='cursor-pointer'>
                <input
                  type='file'
                  className='hidden'
                  accept='image/png,image/jpeg,image/svg+xml'
                  onChange={handleLogoUpload}
                  // disabled={uploadLogo.isPending}
                />
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  className='!p-2'
                >
                  {/* {uploadLogo.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : ( */}
                  <Upload className='w-4 h-4' />
                  {/* )} */}
                </Button>
              </label>
            </div>
          </div>
          <div className='text-sm text-gray-500 text-center'>
            <p>Recommended logo specifications:</p>
            <ul>
              <li>Maximum size: 2MB</li>
              <li>Dimensions: 400x400 pixels or smaller</li>
              <li>Format: PNG, JPG, or SVG</li>
              <li>Background: Transparent or white</li>
            </ul>
          </div>
        </div>

        <Form form={form} onSubmit={onSubmit} className='space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <FormField label='Company Name' name='name' />
            </div>

            <div className='col-span-2'>
              <FormField label='Address' name='address' />
            </div>

            <FormField label='Phone' name='phone' type='tel' />

            <FormField label='Email' name='email' type='email' />

            <div className='col-span-2'>
              <FormField
                label='Website'
                name='website'
                type='url'
                placeholder='https://'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <Button
              type='submit'
              disabled={updateCompanyInfo.isPending || !form.formState.isDirty}
            >
              {updateCompanyInfo.isPending ? (
                <>
                  <LoadingSpinner size='sm' className='mr-2' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
}
