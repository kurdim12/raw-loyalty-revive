
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import supabase from '../services/supabase';
import { Reward, Redemption } from '../types/database';

export const useRewards = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = async (): Promise<Reward[]> => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', true);

    if (error) throw new Error(error.message);
    return data || [];
  };

  const fetchUserRedemptions = async (): Promise<Redemption[]> => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('redemptions')
      .select('*, rewards(*)')
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data: rewards, isLoading: rewardsLoading, refetch: refetchRewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: fetchRewards,
  });

  const { data: redemptions, isLoading: redemptionsLoading, refetch: refetchRedemptions } = useQuery({
    queryKey: ['redemptions', userId],
    queryFn: fetchUserRedemptions,
    enabled: !!userId,
  });

  const redeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!userId) {
      setError('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);

      // First create a redemption
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('redemptions')
        .insert([{
          user_id: userId,
          reward_id: rewardId,
          points_spent: pointsRequired,
        }])
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Then create a transaction for the points deduction
      const reward = rewards?.find(r => r.id === rewardId);
      
      if (!reward) throw new Error('Reward not found');
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: 'redeemed',
          points: pointsRequired,
          description: `Redeemed: ${reward.name}`,
        }]);

      if (transactionError) throw transactionError;

      // Refresh redemptions and rewards
      refetchRedemptions();
      
      setLoading(false);
      return { success: true, data: redemptionData };
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to redeem reward');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to redeem reward' 
      };
    }
  };

  return {
    rewards: rewards || [],
    redemptions: redemptions || [],
    isLoading: rewardsLoading || redemptionsLoading || loading,
    error,
    redeemReward,
    refetchRewards,
    refetchRedemptions,
  };
};

export default useRewards;
