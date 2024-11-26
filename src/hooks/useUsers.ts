import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { UserFormData } from '../lib/validations';

export function useUsers() {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('No user found');

        // Check if user is admin by email first
        const isAdminByEmail = [
          'info@jacsfire.com',
          'marcotonylopez90@gmail.com',
        ].includes(currentUser.email || '');

        if (!isAdminByEmail) {
          // Check role in database
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single();

          if (userRole?.role !== 'admin') {
            // Return only current user's data for non-admins
            return [
              {
                id: currentUser.id,
                email: currentUser.email || '',
                role: userRole?.role || 'tech',
                phone_number: null,
                notify_renewals: false,
                notify_inspections: false,
              },
            ];
          }
        }

        // User is admin, fetch all users
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');

        if (rolesError) throw rolesError;

        // Get all users from auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();

        // Combine the data
        return userRoles.map((role) => {
          const user = authUsers.users?.find((u) => u.id === role.user_id);
          return {
            id: role.user_id,
            email: user?.email || '',
            role: role.role,
            phone_number: role.phone_number,
            notify_renewals: role.notify_renewals,
            notify_inspections: role.notify_inspections,
          };
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: UserFormData) => {
      try {
        if (!userData.email) {
          throw new Error('Email is required to create a user');
        }
        // First create the auth user
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email: userData.email,
            password: Math.random().toString(36).slice(-8), // Generate random password
          });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('No user returned from signup');

        // Then create the user role
        const { error: roleError } = await supabase.from('user_roles').insert([
          {
            user_id: authData.user.id,
            role: userData.role,
            phone_number: userData.phone_number,
            notify_renewals: userData.notify_renewals,
            notify_inspections: userData.notify_inspections,
          },
        ]);

        if (roleError) throw roleError;

        return authData.user;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        'User created successfully. They will receive an email to set their password.'
      );
    },
    onError: (error) => {
      toast.error('Failed to create user');
      console.error('Error creating user:', error);
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UserFormData>;
    }) => {
      try {
        const { error } = await supabase
          .from('user_roles')
          .update({
            role: data.role,
            phone_number: data.phone_number,
            notify_renewals: data.notify_renewals,
            notify_inspections: data.notify_inspections,
          })
          .eq('user_id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      try {
        // Delete user role first
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (roleError) throw roleError;

        // Then delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(
          userId
        );
        if (authError) throw authError;
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    },
  });

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
  };
}
