
import { useState } from 'react';
import { Profile } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralSectionProps {
  profile: Profile | null;
}

const ReferralSection = ({ profile }: ReferralSectionProps) => {
  const [copied, setCopied] = useState(false);
  
  if (!profile) return null;
  
  const referralCode = profile.referral_code;
  const referralLink = `${window.location.origin}/signup?referral=${referralCode}`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast.error('Failed to copy');
      }
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Refer Friends</CardTitle>
          <Users className="h-5 w-5 text-coffee-mocha" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-coffee-mocha text-sm">
          Share your referral code with friends and you'll both earn bonus points when they sign up!
        </p>
        
        <div className="mt-2">
          <label className="block text-sm font-medium text-coffee-dark mb-1">
            Your Referral Code
          </label>
          <div className="flex space-x-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="flex-1 bg-coffee-light cursor-default"
            />
            <Button 
              onClick={() => copyToClipboard(referralCode)}
              variant={copied ? "outline" : "default"}
              className={copied ? "bg-green-50 text-green-600" : ""}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <div className="mt-2">
          <label className="block text-sm font-medium text-coffee-dark mb-1">
            Referral Link
          </label>
          <div className="flex space-x-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="flex-1 bg-coffee-light cursor-default text-xs sm:text-sm"
            />
            <Button 
              onClick={() => copyToClipboard(referralLink)}
              variant="default"
            >
              Copy
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-coffee-cream bg-opacity-30 rounded-md text-center">
          <p className="text-sm font-medium">Earn 15 points for each friend who signs up!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
