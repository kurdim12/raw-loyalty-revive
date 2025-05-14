
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CircleDollarSign, 
  Gift, 
  Settings, 
  BarChart 
} from 'lucide-react';

type AdminTab = 'users' | 'transactions' | 'rewards' | 'settings' | 'analytics';

interface AdminNavigationProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const AdminNavigation = ({ activeTab, setActiveTab }: AdminNavigationProps) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-2 border-b pb-2">
      <Button
        variant={activeTab === 'users' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('users')}
        className="flex items-center"
      >
        <Users className="mr-2 h-4 w-4" />
        <span>Users</span>
      </Button>
      
      <Button
        variant={activeTab === 'transactions' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('transactions')}
        className="flex items-center"
      >
        <CircleDollarSign className="mr-2 h-4 w-4" />
        <span>Add Points</span>
      </Button>
      
      <Button
        variant={activeTab === 'rewards' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('rewards')}
        className="flex items-center"
      >
        <Gift className="mr-2 h-4 w-4" />
        <span>Rewards</span>
      </Button>
      
      <Button
        variant={activeTab === 'settings' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('settings')}
        className="flex items-center"
      >
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </Button>
      
      <Button
        variant={activeTab === 'analytics' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('analytics')}
        className="flex items-center"
      >
        <BarChart className="mr-2 h-4 w-4" />
        <span>Analytics</span>
      </Button>
    </div>
  );
};

export default AdminNavigation;
