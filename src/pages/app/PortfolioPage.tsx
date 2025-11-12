import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview';
import { AssetAllocationChart } from '@/components/portfolio/AssetAllocationChart';
import { Lock } from 'lucide-react';

export function PortfolioPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription.tier !== 'free';

  if (!isPremium) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-white/10 max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-yellow-500" />
              <CardTitle>Premium Feature</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Portfolio tracking is available for Premium subscribers.
            </p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 text-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
      
      <div className="space-y-6">
        <PortfolioOverview />
        <AssetAllocationChart />
        
        {/* Add more portfolio features */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-8">
              Holdings management coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}