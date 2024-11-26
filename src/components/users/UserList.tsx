import { useState } from 'react';
import { Edit2, Trash2, Shield, UserCheck } from 'lucide-react';
import { DataTable } from '../DataTable';
import Button from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { useUsers } from '../../hooks/useUsers';
import { UserForm } from './UserForm';

interface UserListProps {
  isAdmin: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function UserList({ isAdmin }: UserListProps) {
  const { users, deleteUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteUser.mutateAsync(userToDelete);
    setUserToDelete(null);
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user: any) => (
        <div className='flex items-center'>
          {user.role === 'admin' ? (
            <Shield className='w-4 h-4 text-red-500 mr-2' />
          ) : (
            <UserCheck className='w-4 h-4 text-green-500 mr-2' />
          )}
          <span>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user: any) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {user.role === 'admin' ? 'Administrator' : 'Technician'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (user: any) => (
        <div className='text-sm text-gray-900'>{user.phone_number || '-'}</div>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      render: (user: any) => (
        <div className='space-y-1 text-sm'>
          {user.notify_renewals && (
            <div className='text-gray-600'>Contract Renewals</div>
          )}
          {user.notify_inspections && (
            <div className='text-gray-600'>Upcoming Inspections</div>
          )}
          {!user.notify_renewals && !user.notify_inspections && (
            <div className='text-gray-400'>None</div>
          )}
        </div>
      ),
    },
  ];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <DataTable
        data={users.data || []}
        columns={columns}
        searchKeys={['email', 'role', 'phone_number']}
        actions={
          isAdmin
            ? (user) => (
                <>
                  <Button
                    variant='secondary'
                    size='sm'
                    className='mr-2'
                    onClick={() => setSelectedUser(user)}
                  >
                    <Edit2 className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => setUserToDelete(user.id)}
                    disabled={user.role === 'admin'} // Prevent deleting admin users
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </>
              )
            : undefined
        }
      />

      {selectedUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full'>
            <UserForm
              user={selectedUser}
              onCancel={() => setSelectedUser(null)}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!userToDelete}
        title='Delete User'
        message='Are you sure you want to delete this user? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </>
  );
}
