import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

function RequireAuth() {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Restrict tech users to inspections page and create inspection page only
  if (userRole === 'tech') {
    const allowedPaths = ['/inspections', '/inspections/new'];
    const currentPath = location.pathname;

    if (!allowedPaths.some((path) => currentPath.startsWith(path))) {
      return <Navigate to='/inspections' replace />;
    }
  }

  return <Outlet />;
}

export default RequireAuth;
