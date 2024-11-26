import { useState } from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { UserList } from '../components/users/UserList';
import { UserForm } from '../components/users/UserForm';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const { users } = useUsers();
  const { isLoading, error } = users;
  const { userRole } = useAuth();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 rounded-lg'>
        <div className='flex items-center'>
          <AlertTriangle className='w-5 h-5 text-red-500 mr-2' />
          <span className='text-red-700'>
            Error loading users: {(error as Error).message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>
            User Management
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            {userRole === 'admin'
              ? 'Manage user access and permissions'
              : 'View your user profile'}
          </p>
        </div>
        {userRole === 'admin' && (
          <Button
            onClick={() => setShowNewUserForm(true)}
            className='flex items-center'
          >
            <UserPlus className='w-4 h-4 mr-2' />
            New User
          </Button>
        )}
      </div>

      {showNewUserForm && (
        <Card>
          <UserForm onCancel={() => setShowNewUserForm(false)} />
        </Card>
      )}

      <Card>
        {!users.data?.length ? (
          <EmptyState
            title='No users found'
            description={
              userRole === 'admin'
                ? 'Start by adding your first user'
                : 'No user data available'
            }
            action={
              userRole === 'admin'
                ? {
                    label: 'Add User',
                    onClick: () => setShowNewUserForm(true),
                  }
                : undefined
            }
          />
        ) : (
          <UserList isAdmin={userRole === 'admin'} />
        )}
      </Card>
    </div>
  );
}

export default UserManagement;
