
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useTransactions from '@/hooks/useTransactions';
import Layout from '@/components/shared/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Gift, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const { transactions, isLoading: transactionsLoading } = useTransactions(user?.id);

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  // Welcome toast for new users
  useEffect(() => {
    if (profile && transactions?.length === 1) {
      const firstTransaction = transactions[0];
      if (firstTransaction.type === 'bonus' && firstTransaction.description.includes('Welcome')) {
        toast.success(
          `Welcome to Raw Coffee Shop rewards! You've received ${firstTransaction.points} points as a signup bonus.`,
          { duration: 5000 }
        );
      }
    }
  }, [profile, transactions]);

  const calculateRankProgress = () => {
    if (!profile) return 0;
    
    let nextThreshold = 200; // Silver
    let currentThreshold = 0;
    
    if (profile.rank === 'Silver') {
      currentThreshold = 200;
      nextThreshold = 550; // Gold
    } else if (profile.rank === 'Gold') {
      return 100;
    }
    
    const progress = ((profile.lifetime_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(0, progress), 100);
  };

  const pointsToNextRank = () => {
    if (!profile) return 0;
    
    if (profile.rank === 'Bronze') return Math.max(200 - profile.lifetime_points, 0);
    if (profile.rank === 'Silver') return Math.max(550 - profile.lifetime_points, 0);
    return 0;
  };

  const getNextRank = () => {
    if (!profile) return 'Silver';
    if (profile.rank === 'Bronze') return 'Silver';
    if (profile.rank === 'Silver') return 'Gold';
    return 'Gold';
  };

  const getRankDiscount = () => {
    if (!profile) return 10;
    const discounts = { Bronze: 10, Silver: 15, Gold: 25 };
    return discounts[profile.rank] || 0;
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    
    const link = `${window.location.origin}/signup?referral=${profile.referral_code}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Referral link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <Layout loading={profileLoading && !profile}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-coffee-dark">Your Dashboard</h1>
        </div>

        {/* Points & Rank Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Points */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Gift className="w-12 h-12 mx-auto mb-2 text-coffee-mocha" />
                <h3 className="text-lg font-medium text-coffee-dark">Current Points</h3>
                <p className="text-3xl font-bold text-coffee-espresso">{profile?.points || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Current Rank */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-coffee-mocha" />
                <h3 className="text-lg font-medium text-coffee-dark">Current Rank</h3>
                <p className="text-2xl font-bold text-coffee-espresso">{profile?.rank || 'Bronze'}</p>
                <p className="text-sm text-coffee-mocha">{getRankDiscount()}% discount on all purchases</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Progress to Next Rank */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-2 text-coffee-mocha" />
                <h3 className="text-lg font-medium text-coffee-dark">Next Rank Progress</h3>
                <div className="mt-4">
                  <Progress value={calculateRankProgress()} className="h-2" />
                  <p className="text-sm text-coffee-mocha mt-2">
                    {profile?.rank === 'Gold' 
                      ? 'Maximum rank achieved!' 
                      : `${pointsToNextRank()} points to ${getNextRank()}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Transaction History */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                {transactionsLoading ? (
                  <p className="text-center py-4 text-coffee-mocha">Loading transactions...</p>
                ) : !transactions || transactions.length === 0 ? (
                  <p className="text-center py-4 text-coffee-mocha">No transactions yet. Make a purchase to earn points!</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-start p-3 bg-coffee-cream bg-opacity-20 rounded">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-coffee-mocha">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            {transaction.drink_type && ` • ${transaction.drink_type}`}
                          </p>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'earned' || transaction.type === 'bonus' || transaction.type === 'referral'
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'redeemed' ? '-' : '+'}{transaction.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {/* Referral Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Refer Friends & Earn Points</h2>
                <p className="text-coffee-mocha mb-4">
                  Share your referral code and earn 15 points for each friend who signs up!
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-1">
                      Your Referral Code
                    </label>
                    <Input
                      readOnly
                      value={profile?.referral_code || ''}
                      className="bg-coffee-light cursor-default"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-1">
                      Referral Link
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/signup?referral=${profile?.referral_code || ''}`}
                        className="flex-1 bg-coffee-light cursor-default text-xs sm:text-sm"
                      />
                      <Button onClick={copyReferralLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-coffee-cream bg-opacity-30 rounded-md text-center">
                    <p className="text-sm font-medium text-coffee-dark">Earn 15 points for each friend who signs up!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
