import React from 'react';
import { Upload } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';

export function CompanyLogo() {
  // uncomment this and remove the code one line below when uploadLogo becomes active
  // and uncomment all code related to uploadLogo in whole component
  // const { companyInfo, uploadLogo } = useCompanyInfo();
  const { companyInfo } = useCompanyInfo();
  const [previewUrl, setPreviewUrl] = React.useState<string>(
    companyInfo.data?.logo_url || ''
  );

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // await uploadLogo.mutateAsync(file);
  };

  return (
    <Card title='Company Logo'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='relative'>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt='Company logo'
              className='w-32 h-32 object-contain border rounded-lg'
            />
          ) : (
            <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
              <span className='text-gray-400'>No logo</span>
            </div>
          )}
          <label className='absolute bottom-2 right-2'>
            <input
              type='file'
              className='hidden'
              accept='image/*'
              onChange={handleLogoUpload}
              // disabled={uploadLogo.isLoading}
            />
            <Button
              type='button'
              size='sm'
              variant='secondary'
              className='!p-1'
            >
              <Upload className='w-4 h-4' />
            </Button>
          </label>
        </div>
        <p className='text-sm text-gray-500'>Recommended size: 200x200px</p>
      </div>
    </Card>
  );
}
