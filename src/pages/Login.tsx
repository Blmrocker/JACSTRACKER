import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Navigate, useLocation } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

function Login() {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <LoadingSpinner size='lg' className='mx-auto mb-4' />
          <p className='text-sm text-gray-500'>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (user && userRole) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='flex justify-center'>
          <div className='bg-red-600 p-3 rounded-lg shadow-lg'>
            <Flame className='h-12 w-12 text-white' />
          </div>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Jac's Fire Tracker
        </h2>
        <p className='mt-2 text-center text-sm text-gray-600'>
          Professional Fire Safety Management
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10'>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#dc2626',
                    brandAccent: '#b91c1c',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    defaultButtonBorder: 'transparent',
                    defaultButtonText: '#374151',
                    dividerBackground: '#e5e7eb',
                    inputBackground: 'white',
                    inputBorder: '#d1d5db',
                    inputBorderHover: '#dc2626',
                    inputBorderFocus: '#dc2626',
                    inputText: '#374151',
                    inputLabelText: '#374151',
                    inputPlaceholder: '#9ca3af',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'w-full',
                label: 'text-sm font-medium text-gray-700 mb-1',
                button:
                  'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                input:
                  'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />

          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>
                  Fire Safety Management System
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
