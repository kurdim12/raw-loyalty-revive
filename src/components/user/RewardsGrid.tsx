
import { useState } from 'react';
import { Reward } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Gift } from 'lucide-react';

interface NextRankInfo {
  name: string;
  discount: string;
  pointsNeeded: number;
}

interface RewardsGridProps {
  rewards: Reward[];
  userPoints: number;
  onRedeemReward: (rewardId: string, pointsRequired: number) => Promise<{ success: boolean, error?: string }>;
  onSavePoints: () => { success: boolean, error?: string };
  isLoading?: boolean;
  nextRankInfo: NextRankInfo;
}

const RewardsGrid = ({ 
  rewards, 
  userPoints, 
  onRedeemReward, 
  onSavePoints,
  isLoading = false,
  nextRankInfo
}: RewardsGridProps) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRedeemClick = (reward: Reward) => {
    if (userPoints < reward.points_required) {
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
        setShowConfirmDialog(false);
      }
    } catch (error) {
      // Error is handled in the onRedeemReward function
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleSaveForLater = () => {
    setShowConfirmDialog(false);
    onSavePoints();
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

      {/* Confirmation Dialog with Choice System */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Your Choice</DialogTitle>
            <DialogDescription>
              You have two options for using your {selectedReward?.points_required} points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium mb-3">You have {userPoints} points available.</p>
            <ol className="space-y-4 text-sm">
              <li className="p-3 border rounded-md bg-green-50 border-green-100">
                <span className="font-bold block text-base">Redeem Now</span>
                <span className="text-sm text-gray-600 block mb-2">Use {selectedReward?.points_required} points for this reward</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Immediate benefit
                </span>
              </li>
              <li className="p-3 border rounded-md bg-blue-50 border-blue-100">
                <span className="font-bold block text-base">Save for {nextRankInfo.name} Rank</span>
                <span className="text-sm text-gray-600 block mb-2">Keep your points and get {nextRankInfo.discount} discount at {nextRankInfo.name} rank</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Need {nextRankInfo.pointsNeeded} more points for next rank
                </span>
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
