
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useRewards from '@/hooks/useRewards';
import Layout from '@/components/shared/Layout';
import RewardsGrid from '@/components/user/RewardsGrid';

const Rewards = () => {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile(user?.id);
  const { rewards, isLoading: rewardsLoading, redeemReward } = useRewards(user?.id);

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    // Check if user has enough points
    if (!profile || profile.points < pointsRequired) {
      return { 
        success: false, 
        error: 'Not enough points to redeem this reward' 
      };
    }

    const result = await redeemReward(rewardId, pointsRequired);
    
    // Refresh profile to get updated points
    if (result.success) {
      await refetchProfile();
    }
    
    return result;
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
          isLoading={rewardsLoading || !rewards}
        />
      </div>
    </Layout>
  );
};

export default Rewards;
