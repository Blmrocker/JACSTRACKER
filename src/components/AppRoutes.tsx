import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import Clients from '../pages/Clients';
import Inspections from '../pages/Inspections';
import UserManagement from '../pages/UserManagement';
import CompanySettings from '../pages/CompanySettings';
import Login from '../pages/Login';
import RequireAuth from './RequireAuth';

function AppRoutes() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to='/dashboard' replace />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='reports' element={<Reports />} />
          <Route path='clients' element={<Clients />} />
          <Route path='inspections' element={<Inspections />} />
          <Route path='users' element={<UserManagement />} />
          <Route path='settings' element={<CompanySettings />} />
        </Route>
      </Route>
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
}

export default AppRoutes;
