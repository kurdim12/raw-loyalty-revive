
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface RankThresholds {
  Silver: number;
  Gold: number;
}

interface DrinkPoints {
  [key: string]: number;
}

interface AdminEmails {
  emails: string[];
}

const SettingsManagement = () => {
  const [rankThresholds, setRankThresholds] = useState<RankThresholds>({
    Silver: 100,
    Gold: 300
  });
  
  const [drinkPoints, setDrinkPoints] = useState<DrinkPoints>({
    'White Tradition': 4,
    'Black Tradition': 3,
    'Raw Signature': 5,
    'Raw Specialty': 6
  });
  
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch rank thresholds
      const { data: rankData, error: rankError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'rank_thresholds')
        .single();
      
      if (rankError && rankError.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        console.error('Error fetching rank thresholds:', rankError);
      }
      
      if (rankData?.value) {
        setRankThresholds(rankData.value as RankThresholds);
      }
      
      // Fetch drink points
      const { data: drinkData, error: drinkError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'drink_points')
        .single();
      
      if (drinkError && drinkError.code !== 'PGRST116') {
        console.error('Error fetching drink points:', drinkError);
      }
      
      if (drinkData?.value) {
        setDrinkPoints(drinkData.value as DrinkPoints);
      }
      
      // Fetch admin emails
      const { data: adminData, error: adminError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_emails')
        .single();
      
      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error fetching admin emails:', adminError);
      }
      
      if (adminData?.value) {
        setAdminEmails((adminData.value as string[]) || []);
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const saveRankThresholds = async () => {
    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'rank_thresholds',
        value: rankThresholds
      }, { onConflict: 'key' });
      
      if (error) throw error;
      
      toast.success('Rank thresholds updated');
    } catch (error) {
      console.error('Error saving rank thresholds:', error);
      toast.error('Failed to save rank thresholds');
    }
  };
  
  const saveDrinkPoints = async () => {
    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'drink_points',
        value: drinkPoints
      }, { onConflict: 'key' });
      
      if (error) throw error;
      
      toast.success('Drink points updated');
    } catch (error) {
      console.error('Error saving drink points:', error);
      toast.error('Failed to save drink points');
    }
  };
  
  const addAdminEmail = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (adminEmails.includes(newAdminEmail)) {
      toast.error('This email is already an admin');
      return;
    }
    
    try {
      const updatedEmails = [...adminEmails, newAdminEmail];
      
      const { error } = await supabase.from('settings').upsert({
        key: 'admin_emails',
        value: updatedEmails
      }, { onConflict: 'key' });
      
      if (error) throw error;
      
      setAdminEmails(updatedEmails);
      setNewAdminEmail('');
      toast.success('Admin email added');
    } catch (error) {
      console.error('Error adding admin email:', error);
      toast.error('Failed to add admin email');
    }
  };
  
  const removeAdminEmail = async (email: string) => {
    try {
      const updatedEmails = adminEmails.filter(e => e !== email);
      
      const { error } = await supabase.from('settings').upsert({
        key: 'admin_emails',
        value: updatedEmails
      }, { onConflict: 'key' });
      
      if (error) throw error;
      
      setAdminEmails(updatedEmails);
      toast.success('Admin email removed');
    } catch (error) {
      console.error('Error removing admin email:', error);
      toast.error('Failed to remove admin email');
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Rank Thresholds</CardTitle>
          <CardDescription>Set the lifetime points required to reach each rank</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="silver">Silver Rank</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="silver"
                    type="number"
                    value={rankThresholds.Silver}
                    onChange={(e) => setRankThresholds({
                      ...rankThresholds,
                      Silver: parseInt(e.target.value) || 0
                    })}
                    min={1}
                  />
                  <span>points</span>
                </div>
              </div>
              <div>
                <Label htmlFor="gold">Gold Rank</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="gold"
                    type="number"
                    value={rankThresholds.Gold}
                    onChange={(e) => setRankThresholds({
                      ...rankThresholds,
                      Gold: parseInt(e.target.value) || 0
                    })}
                    min={1}
                  />
                  <span>points</span>
                </div>
              </div>
            </div>
            <Button onClick={saveRankThresholds}>Save Rank Thresholds</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Drink Points</CardTitle>
          <CardDescription>Configure the points awarded for each drink type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(drinkPoints).map((drink) => (
                <div key={drink}>
                  <Label htmlFor={`drink-${drink}`}>{drink}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`drink-${drink}`}
                      type="number"
                      value={drinkPoints[drink]}
                      onChange={(e) => {
                        const newPoints = {
                          ...drinkPoints,
                          [drink]: parseInt(e.target.value) || 0
                        };
                        setDrinkPoints(newPoints);
                      }}
                      min={0}
                    />
                    <span>points</span>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={saveDrinkPoints}>Save Drink Points</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Admin Emails</CardTitle>
          <CardDescription>Manage user accounts with admin privileges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <Button onClick={addAdminEmail}>Add Admin</Button>
            </div>
            
            <Separator />
            
            {adminEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin emails configured</p>
            ) : (
              <div className="space-y-2">
                {adminEmails.map((email) => (
                  <div key={email} className="flex justify-between items-center border p-2 rounded">
                    <span>{email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAdminEmail(email)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManagement;
