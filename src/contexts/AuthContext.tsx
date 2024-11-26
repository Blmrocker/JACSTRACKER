import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'tech' | '';
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: '',
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'tech' | ''>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function getUserRole(userId: string, email: string) {
      try {
        // Special handling for admin emails
        const adminEmails = ['info@jacsfire.com', 'marcotonylopez90@gmail.com'];
        if (adminEmails.includes(email)) {
          // Ensure user role exists in database
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

          if (!existingRole) {
            // Create admin role if it doesn't exist
            await supabase.from('user_roles').insert([
              {
                user_id: userId,
                role: 'admin',
                notify_renewals: true,
                notify_inspections: true,
              },
            ]);
          } else if (existingRole.role !== 'admin') {
            // Update to admin if not already
            await supabase
              .from('user_roles')
              .update({ role: 'admin' })
              .eq('user_id', userId);
          }
          return 'admin';
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          return 'tech'; // Default to tech role
        }

        return data?.role || 'tech';
      } catch (error) {
        console.error('Error in getUserRole:', error);
        return 'tech';
      }
    }

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setUser(session.user);
          const role = await getUserRole(
            session.user.id,
            session.user.email || ''
          );
          if (mounted) {
            setUserRole(role as 'admin' | 'tech');
            setLoading(false);
          }
        } else if (mounted) {
          setLoading(false);
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (mounted) {
            if (session?.user) {
              setUser(session.user);
              const role = await getUserRole(
                session.user.id,
                session.user.email || ''
              );
              if (mounted) {
                setUserRole(role as 'admin' | 'tech');
                // Redirect tech users to inspections page after login
                if (role === 'tech') {
                  navigate('/inspections');
                }
              }
            } else {
              setUser(null);
              setUserRole('');
              navigate('/login');
            }
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in initialize:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole('');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
