
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface AnalyticsData {
  userCount: number;
  totalPoints: number;
  redeemedPoints: number;
  activeRewards: number;
  transactionsByType: {
    name: string;
    value: number;
  }[];
  rewardsByCategory: {
    name: string;
    value: number;
  }[];
  pointsOverTime: {
    date: string;
    points: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // User count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Total points
      const { data: pointsData, error: pointsError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', 'id');
      
      let totalPoints = 0;
      if (!pointsError) {
        totalPoints = pointsData?.reduce((sum, user) => sum + user.points, 0) || 0;
      }
      
      // Transactions by type
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('type, points');
      
      let transactionsByType: {[key: string]: number} = {};
      let redeemedPoints = 0;
      
      if (!transactionError && transactionData) {
        transactionData.forEach(t => {
          transactionsByType[t.type] = (transactionsByType[t.type] || 0) + 1;
          if (t.type === 'redeemed') {
            redeemedPoints += t.points;
          }
        });
      }
      
      // Active rewards
      const { count: activeRewards, error: rewardsError } = await supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      
      if (rewardsError) throw rewardsError;
      
      // Rewards by category
      const { data: categoryData, error: categoryError } = await supabase
        .from('rewards')
        .select('category');
      
      let rewardsByCategory: {[key: string]: number} = {};
      
      if (!categoryError && categoryData) {
        categoryData.forEach(r => {
          rewardsByCategory[r.category] = (rewardsByCategory[r.category] || 0) + 1;
        });
      }
      
      // Format data for charts
      const transactionChartData = Object.keys(transactionsByType).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: transactionsByType[key]
      }));
      
      const categoryChartData = Object.keys(rewardsByCategory).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: rewardsByCategory[key]
      }));
      
      // Mock time series data (in a real app, you'd calculate this from transactions)
      const now = new Date();
      const pointsOverTime = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(now.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          points: Math.floor(Math.random() * 100) + 50
        };
      });
      
      setData({
        userCount: userCount || 0,
        totalPoints,
        redeemedPoints,
        activeRewards: activeRewards || 0,
        transactionsByType: transactionChartData,
        rewardsByCategory: categoryChartData,
        pointsOverTime
      });
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading analytics data...</div>;
  }
  
  if (!data) {
    return <div className="text-center py-8">Failed to load analytics data</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Active Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Redeemed Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.redeemedPoints}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeRewards}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Points Earned (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pointsOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.transactionsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.transactionsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
