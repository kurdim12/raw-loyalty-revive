
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useRewards from '@/hooks/useRewards';
import Layout from '@/components/shared/Layout';
import RewardsGrid from '@/components/user/RewardsGrid';
import { toast } from 'sonner';

const Rewards = () => {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile(user?.id);
  const { rewards, isLoading: rewardsLoading, redeemReward } = useRewards(user?.id);

  // Calculate rank info for choice modal
  const getNextRank = () => {
    if (!profile) return 'Silver';
    return profile.rank === 'Bronze' ? 'Silver' : profile.rank === 'Silver' ? 'Gold' : 'Gold+';
  };

  const getRankDiscount = (rank: string) => {
    switch (rank) {
      case 'Bronze': return '10%';
      case 'Silver': return '15%';
      case 'Gold': return '25%';
      default: return '0%';
    }
  };

  const getPointsToNextRank = () => {
    if (!profile) return 100;
    
    // These thresholds could come from settings in a more dynamic implementation
    if (profile.rank === 'Bronze') return 100 - profile.lifetime_points;
    if (profile.rank === 'Silver') return 300 - profile.lifetime_points;
    return 0;
  };

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    // Check if user has enough points
    if (!profile || profile.points < pointsRequired) {
      toast.error('Not enough points to redeem this reward');
      return { 
        success: false, 
        error: 'Not enough points to redeem this reward' 
      };
    }

    const result = await redeemReward(rewardId, pointsRequired);
    
    // Refresh profile to get updated points
    if (result.success) {
      await refetchProfile();
      toast.success(`Reward redeemed successfully!`);
    } else {
      toast.error(result.error || 'Failed to redeem reward');
    }
    
    return result;
  };

  const handleSavePoints = () => {
    toast.info(`Saving points for ${getNextRank()} rank progress (${getRankDiscount(getNextRank())} discount)`);
    return { success: true };
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">Rewards Catalog</h1>
            <p className="text-coffee-mocha mt-1">
              You have {profile?.points || 0} points available to redeem
            </p>
          </div>
        </div>

        <RewardsGrid
          rewards={rewards || []}
          userPoints={profile?.points || 0}
          onRedeemReward={handleRedeemReward}
          onSavePoints={handleSavePoints}
          isLoading={rewardsLoading || !rewards}
          nextRankInfo={{
            name: getNextRank(),
            discount: getRankDiscount(getNextRank()),
            pointsNeeded: getPointsToNextRank()
          }}
        />
      </div>
    </Layout>
  );
};

export default Rewards;
