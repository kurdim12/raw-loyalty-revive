
import { useMemo } from 'react';
import { Profile } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RankProgressProps {
  profile: Profile | null;
}

// These would normally come from your settings table
const RANKS = {
  Bronze: { min: 0, max: 199, discount: 10 },
  Silver: { min: 200, max: 549, discount: 15 },
  Gold: { min: 550, max: Infinity, discount: 25 }
};

const RankProgress = ({ profile }: RankProgressProps) => {
  const progressData = useMemo(() => {
    if (!profile) return null;

    const currentRank = profile.rank;
    const currentPoints = profile.points;
    
    if (currentRank === 'Gold') {
      // Max rank achieved
      return {
        currentRank,
        nextRank: null,
        currentMin: RANKS.Gold.min,
        nextMin: null,
        progress: 100,
        pointsToNext: 0,
        discount: RANKS.Gold.discount
      };
    }
    
    if (currentRank === 'Silver') {
      const pointsToNext = RANKS.Gold.min - currentPoints;
      const progress = ((currentPoints - RANKS.Silver.min) / (RANKS.Gold.min - RANKS.Silver.min)) * 100;
      
      return {
        currentRank,
        nextRank: 'Gold',
        currentMin: RANKS.Silver.min,
        nextMin: RANKS.Gold.min,
        progress: Math.max(0, Math.min(100, progress)),
        pointsToNext,
        discount: RANKS.Silver.discount
      };
    }
    
    // Bronze rank
    const pointsToNext = RANKS.Silver.min - currentPoints;
    const progress = (currentPoints / RANKS.Silver.min) * 100;
    
    return {
      currentRank,
      nextRank: 'Silver',
      currentMin: RANKS.Bronze.min,
      nextMin: RANKS.Silver.min,
      progress: Math.max(0, Math.min(100, progress)),
      pointsToNext,
      discount: RANKS.Bronze.discount
    };
    
  }, [profile]);

  if (!profile || !progressData) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Rank Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">{progressData.currentRank}</span>
          {progressData.nextRank && (
            <span className="text-coffee-mocha">{progressData.nextRank}</span>
          )}
        </div>
        
        <Progress value={progressData.progress} className="h-2" />
        
        <div className="flex items-center justify-between text-sm text-coffee-mocha">
          {progressData.nextRank ? (
            <>
              <span>{Math.floor(progressData.progress)}% Complete</span>
              <span>{progressData.pointsToNext} points to {progressData.nextRank}</span>
            </>
          ) : (
            <span className="w-full text-center">Maximum rank achieved!</span>
          )}
        </div>
        
        <div className="mt-4 p-3 bg-coffee-cream bg-opacity-30 rounded-md">
          <p className="text-sm text-center">
            Your current discount: <span className="font-bold">{progressData.discount}%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RankProgress;
