
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

      // Define the allowed keys for the profile updates
      const validKeys: Array<keyof Profile> = [
        'full_name', 'birthday', 'email',
        'points', 'lifetime_points', 'rank', 'rank_progress',
        'referral_code', 'referred_by', 'phone'
      ];
      
      // Create a properly typed updates object by filtering only valid keys
      const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (validKeys.includes(key as keyof Profile) && value !== undefined) {
          return { ...acc, [key]: value };
        }
        return acc;
      }, {} as Partial<Profile>);

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
