
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/shared/Layout';
import { Button } from '@/components/ui/button';
import { Coffee, Award, Gift, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="space-y-16 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-coffee-espresso">
            Raw Coffee Shop Loyalty Program
          </h1>
          <p className="text-xl text-coffee-mocha max-w-2xl mx-auto">
            Join our rewards program to earn points, unlock exclusive rewards, and enjoy special discounts.
          </p>
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-coffee-mocha hover:bg-coffee-espresso text-white px-8 py-6 text-lg"
            >
              Join Now
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="px-8 py-6 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-coffee-cream flex flex-col items-center text-center">
            <Coffee className="h-12 w-12 text-coffee-mocha mb-4" />
            <h3 className="text-xl font-semibold mb-2">Earn Points</h3>
            <p className="text-coffee-mocha">
              Earn points with every purchase. Different drinks earn different point values!
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-coffee-cream flex flex-col items-center text-center">
            <Award className="h-12 w-12 text-coffee-mocha mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rank Up</h3>
            <p className="text-coffee-mocha">
              Progress through Bronze, Silver, and Gold ranks to unlock higher discounts.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-coffee-cream flex flex-col items-center text-center">
            <Gift className="h-12 w-12 text-coffee-mocha mb-4" />
            <h3 className="text-xl font-semibold mb-2">Redeem Rewards</h3>
            <p className="text-coffee-mocha">
              Use your points for free drinks, merchandise, and exclusive items.
            </p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-coffee-dark">How It Works</h2>
          </div>
          
          <div className="bg-coffee-light rounded-lg p-6">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-coffee-mocha text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Sign up for an account</h3>
                  <p className="text-coffee-mocha">Create an account and get 10 points immediately as a welcome bonus!</p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="bg-coffee-mocha text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Earn points with every purchase</h3>
                  <p className="text-coffee-mocha">
                    Different drinks earn different points:<br />
                    - White Tradition: 4 points<br />
                    - Black Tradition: 3 points<br />
                    - Raw Signature: 5 points<br />
                    - Raw Specialty: 6 points
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="bg-coffee-mocha text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Redeem rewards or save for rank progress</h3>
                  <p className="text-coffee-mocha">
                    Choose to use your points for rewards or save them to reach higher ranks with better discounts!
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <div className="bg-coffee-mocha text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Refer friends to earn more</h3>
                  <p className="text-coffee-mocha">
                    Get 15 bonus points for each friend who signs up using your referral code.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center space-y-6 bg-coffee-cream bg-opacity-50 p-8 rounded-lg">
          <Users className="h-16 w-16 mx-auto text-coffee-espresso" />
          <h2 className="text-3xl font-bold text-coffee-dark">Ready to Join?</h2>
          <p className="text-xl text-coffee-mocha max-w-xl mx-auto">
            Sign up today and start earning rewards with your very first coffee!
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-coffee-mocha hover:bg-coffee-espresso text-white px-8 py-6 text-lg"
            >
              Create an Account
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
