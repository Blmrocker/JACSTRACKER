import { CompanyProfile } from '../components/settings/CompanyProfile';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

function CompanySettings() {
  const { companyInfo } = useCompanyInfo();

  if (companyInfo.isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold text-gray-900'>Company Settings</h1>
      <CompanyProfile />
    </div>
  );
}

export default CompanySettings;
