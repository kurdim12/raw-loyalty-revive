
import { Profile } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee } from 'lucide-react';

interface PointsDisplayProps {
  profile: Profile | null;
}

const PointsDisplay = ({ profile }: PointsDisplayProps) => {
  if (!profile) return null;

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'gold':
        return 'bg-gold-gradient text-coffee-dark';
      case 'silver':
        return 'bg-silver-gradient text-coffee-dark';
      default:
        return 'bg-bronze-gradient text-coffee-dark';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`p-4 ${getRankColor(profile.rank)}`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{profile.rank} Member</h3>
          <Coffee className="h-6 w-6" />
        </div>
      </div>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-coffee-espresso mb-2">
            {profile.points}
          </div>
          <p className="text-coffee-mocha">Available Points</p>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-coffee-mocha">
            Lifetime points: <span className="font-medium">{profile.lifetime_points}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;
