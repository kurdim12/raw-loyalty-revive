
import { useState } from 'react';
import Layout from '@/components/shared/Layout';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UserManagement from '@/components/admin/UserManagement';
import TransactionManagement from '@/components/admin/TransactionManagement';
import RewardManagement from '@/components/admin/RewardManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

type AdminTab = 'users' | 'transactions' | 'rewards' | 'settings' | 'analytics';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-coffee-dark">Admin Dashboard</h1>
        </div>

        <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="bg-white rounded-lg p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'transactions' && <TransactionManagement />}
          {activeTab === 'rewards' && <RewardManagement />}
          {activeTab === 'settings' && <SettingsManagement />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
