
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import supabase from '../services/supabase';
import { Profile } from '../types/database';

export const useProfile = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (): Promise<Profile | null> => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  const { data: profile, isLoading: profileLoading, refetch } = useQuery({
    queryKey: ['profile', userId],
    queryFn: fetchProfile,
    enabled: !!userId,
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);

      // Remove any fields that are not in the database schema
      const validUpdates: Partial<Profile> = {};
      if (updates.full_name !== undefined) validUpdates.full_name = updates.full_name;
      if (updates.birthday !== undefined) validUpdates.birthday = updates.birthday;
      // Add other valid fields as needed

      const { data, error } = await supabase
        .from('profiles')
        .update(validUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Refresh profile data
      refetch();

      setLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  };

  return {
    profile,
    isLoading: profileLoading || loading,
    error,
    updateProfile,
    refetch,
  };
};

export default useProfile;
