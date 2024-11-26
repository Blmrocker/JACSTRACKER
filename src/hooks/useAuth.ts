import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useSupabaseAuth } from '../contexts/MockAuthContext';

export function useAuth() {
  const auth = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
      navigate('/login');
    }
  }, [auth.user, navigate]);

  return auth;
}
