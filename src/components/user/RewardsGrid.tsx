
import { useState } from 'react';
import { Reward } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';

interface RewardsGridProps {
  rewards: Reward[];
  userPoints: number;
  onRedeemReward: (rewardId: string, pointsRequired: number) => Promise<{ success: boolean, error?: string }>;
  isLoading?: boolean;
}

const RewardsGrid = ({ rewards, userPoints, onRedeemReward, isLoading = false }: RewardsGridProps) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRedeemClick = (reward: Reward) => {
    if (userPoints < reward.points_required) {
      toast.error('Not enough points to redeem this reward');
      return;
    }
    
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    
    setIsRedeeming(true);
    try {
      const result = await onRedeemReward(selectedReward.id, selectedReward.points_required);
      
      if (result.success) {
        toast.success(`Successfully redeemed ${selectedReward.name}`);
        setShowConfirmDialog(false);
      } else {
        toast.error(result.error || 'Failed to redeem reward');
      }
    } catch (error) {
      toast.error('An error occurred while redeeming');
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSaveForLater = () => {
    setShowConfirmDialog(false);
    toast.info('Saving points for rank progression');
  };

  return (
    <>
      {isLoading ? (
        <div className="text-center py-8">Loading rewards...</div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-8">No rewards available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{reward.name}</h3>
                  <Gift className="h-5 w-5 text-coffee-mocha" />
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
                  <span className={`text-sm ${userPoints >= reward.points_required ? 'text-green-600' : 'text-red-600'}`}>
                    {userPoints >= reward.points_required 
                      ? 'Available' 
                      : `Need ${reward.points_required - userPoints} more`}
                  </span>
                </div>
                <Button 
                  onClick={() => handleRedeemClick(reward)}
                  disabled={userPoints < reward.points_required}
                  className="w-full"
                >
                  Redeem Reward
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              You're about to redeem {selectedReward?.name} for {selectedReward?.points_required} points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium mb-2">You have two options:</p>
            <ol className="space-y-2 text-sm">
              <li className="p-2 border rounded-md bg-green-50 border-green-100">
                <span className="font-bold block">Redeem Now</span>
                <span className="text-sm text-gray-600">Use {selectedReward?.points_required} points for this reward</span>
              </li>
              <li className="p-2 border rounded-md bg-blue-50 border-blue-100">
                <span className="font-bold block">Save for Rank Progress</span>
                <span className="text-sm text-gray-600">Keep your points and progress towards next rank</span>
              </li>
            </ol>
          </div>
          
          <Separator />
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={handleSaveForLater}
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
    </>
  );
};

export default RewardsGrid;
