import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard as Dashboard,
  BarChart3,
  Users,
  ClipboardCheck,
  UserCog,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import clsx from 'clsx';

function Layout() {
  const { userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define all navigation items
  const navItems = [
    {
      path: '/dashboard',
      icon: Dashboard,
      label: 'Dashboard',
      adminOnly: true,
    },
    { path: '/reports', icon: BarChart3, label: 'Reports', adminOnly: true },
    { path: '/clients', icon: Users, label: 'Clients', adminOnly: true },
    {
      path: '/inspections',
      icon: ClipboardCheck,
      label: 'Inspections',
      adminOnly: false,
    },
    { path: '/users', icon: UserCog, label: 'Users', adminOnly: true },
    { path: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavLink = ({
    item,
    mobile = false,
  }: {
    item: (typeof navItems)[0];
    mobile?: boolean;
  }) => (
    <Link
      to={item.path}
      onClick={() => setMobileMenuOpen(false)}
      className={clsx(
        'inline-flex items-center',
        mobile
          ? 'px-4 py-3 text-base w-full hover:bg-gray-50'
          : 'px-1 pt-1 text-sm font-medium',
        location.pathname === item.path
          ? mobile
            ? 'text-red-600 bg-red-50'
            : 'text-red-600 border-b-2 border-red-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      <item.icon className={clsx('w-4 h-4', mobile ? 'mr-3' : 'mr-2')} />
      {item.label}
    </Link>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <div className='flex-shrink-0 flex items-center'>
                <Flame className='h-8 w-8 text-red-600' />
                <span className='ml-2 text-xl font-bold text-gray-900'>
                  Jac's Fire Tracker
                </span>
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                {filteredNavItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <Button
                variant='secondary'
                size='sm'
                onClick={handleSignOut}
                className='hidden sm:flex items-center'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Sign Out
              </Button>

              <button
                type='button'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500'
              >
                {mobileMenuOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={clsx('sm:hidden', !mobileMenuOpen && 'hidden')}>
          <div className='pt-2 pb-3 space-y-1 border-t border-gray-200'>
            {filteredNavItems.map((item) => (
              <NavLink key={item.path} item={item} mobile />
            ))}
            <button
              onClick={handleSignOut}
              className='flex items-center w-full px-4 py-3 text-base text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            >
              <LogOut className='w-4 h-4 mr-3' />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
