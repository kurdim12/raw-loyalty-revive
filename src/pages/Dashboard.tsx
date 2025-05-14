
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useTransactions from '@/hooks/useTransactions';
import Layout from '@/components/shared/Layout';
import PointsDisplay from '@/components/user/PointsDisplay';
import RankProgress from '@/components/user/RankProgress';
import TransactionHistory from '@/components/user/TransactionHistory';
import ReferralSection from '@/components/user/ReferralSection';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, refreshProfile } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const { transactions, isLoading: transactionsLoading } = useTransactions(user?.id);

  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

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

  return (
    <Layout loading={profileLoading && !profile}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-coffee-dark">Your Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PointsDisplay profile={profile} />
          <RankProgress profile={profile} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionHistory 
              transactions={transactions || []} 
              loading={transactionsLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <ReferralSection profile={profile} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
