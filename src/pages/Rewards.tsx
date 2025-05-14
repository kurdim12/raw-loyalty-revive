
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useRewards from '@/hooks/useRewards';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Gift, Coffee, Package, Percent, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Rewards = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { rewards, isLoading: rewardsLoading, redeemReward } = useRewards(user?.id);
  
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drinks': return <Coffee className="h-5 w-5" />;
      case 'merchandise': return <Package className="h-5 w-5" />;
      case 'discounts': return <Percent className="h-5 w-5" />;
      case 'experiences': return <GraduationCap className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const handleRedeemClick = (reward: any) => {
    if (!profile || profile.points < reward.points_required) return;
    
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !profile) return;
    
    setIsRedeeming(true);
    try {
      const result = await redeemReward(selectedReward.id, selectedReward.points_required);
      
      if (result.success) {
        toast.success(`Reward redeemed successfully!`);
        setShowConfirmDialog(false);
      } else {
        toast.error(result.error || 'Failed to redeem reward');
      }
    } catch (error) {
      toast.error('An error occurred while redeeming the reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getNextRank = () => {
    if (!profile) return 'Silver';
    if (profile.rank === 'Bronze') return 'Silver';
    if (profile.rank === 'Silver') return 'Gold';
    return 'Gold';
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
    
    if (profile.rank === 'Bronze') return Math.max(200 - profile.lifetime_points, 0);
    if (profile.rank === 'Silver') return Math.max(550 - profile.lifetime_points, 0);
    return 0;
  };

  const handleSavePoints = () => {
    toast.info(`Saving points for ${getNextRank()} rank progress (${getRankDiscount(getNextRank())} discount)`);
    setShowConfirmDialog(false);
  };

  return (
    <Layout loading={rewardsLoading && !rewards}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">Rewards Catalog</h1>
            <p className="text-coffee-mocha mt-1">
              You have {profile?.points || 0} points available to redeem
            </p>
          </div>
        </div>

        {rewardsLoading ? (
          <div className="text-center py-8">Loading rewards...</div>
        ) : !rewards || rewards.length === 0 ? (
          <div className="text-center py-8">No rewards available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="flex flex-col h-full overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{reward.name}</h3>
                    {getCategoryIcon(reward.category)}
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-1">
                  <p className="text-sm text-coffee-mocha">
                    {reward.description || 'No description available'}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-cream text-coffee-espresso">
                      {reward.category}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex flex-col items-stretch border-t border-coffee-cream">
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="font-bold">{reward.points_required} points</span>
                    <span className={`text-sm ${profile && profile.points >= reward.points_required ? 'text-green-600' : 'text-red-600'}`}>
                      {profile && profile.points >= reward.points_required 
                        ? 'Available' 
                        : `Need ${profile ? (reward.points_required - profile.points) : reward.points_required} more`}
                    </span>
                  </div>
                  <Button 
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!profile || profile.points < reward.points_required}
                    className="w-full"
                  >
                    Redeem Reward
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Choice Modal Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Make Your Choice</DialogTitle>
              <DialogDescription>
                You have two options for using your {selectedReward?.points_required} points.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-sm font-medium mb-3">You have {profile?.points || 0} points available.</p>
              <ol className="space-y-4 text-sm">
                <li className="p-3 border rounded-md bg-green-50 border-green-100">
                  <span className="font-bold block text-base">Redeem Now</span>
                  <span className="text-sm text-gray-600 block mb-2">Use {selectedReward?.points_required} points for this reward</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Immediate benefit
                  </span>
                </li>
                <li className="p-3 border rounded-md bg-blue-50 border-blue-100">
                  <span className="font-bold block text-base">Save for {getNextRank()} Rank</span>
                  <span className="text-sm text-gray-600 block mb-2">Keep your points and get {getRankDiscount(getNextRank())} discount at {getNextRank()} rank</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Need {getPointsToNextRank()} more points for next rank
                  </span>
                </li>
              </ol>
            </div>
            
            <Separator />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="secondary"
                onClick={handleSavePoints}
              >
                Save for Later
              </Button>
              <Button
                onClick={handleConfirmRedeem}
                disabled={isRedeeming}
              >
                Redeem Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Rewards;
