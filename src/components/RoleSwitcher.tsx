import { useAuth } from '../contexts/AuthContext';
import { UserCog } from 'lucide-react';
import Button from './Button';

export function RoleSwitcher() {
  const { userRole, actualRole, setTempRole } = useAuth();

  // Only show for actual admin users
  if (actualRole !== 'admin') {
    return null;
  }

  const handleRoleSwitch = () => {
    const newRole = userRole === 'admin' ? 'tech' : 'admin';
    setTempRole(newRole);
  };

  return (
    <Button
      variant='secondary'
      size='sm'
      onClick={handleRoleSwitch}
      className='flex items-center'
    >
      <UserCog className='w-4 h-4 mr-2' />
      {userRole === 'admin' ? 'Switch to Tech View' : 'Switch to Admin View'}
    </Button>
  );
}
