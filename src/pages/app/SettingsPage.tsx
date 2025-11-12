import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    toast.success('Language updated');
  };

  const handleLogout = () => {
    signOut();
    window.location.href = '/login';
  };

  return (
    <div className="h-full p-6 text-white overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">{t('nav.settings')}</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.user.email || ''}
                disabled
                className="bg-gray-700 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={user?.user.fullName || ''}
                className="bg-gray-700 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={i18n.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="bg-gray-700 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="bg-gray-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-2">Current Plan</p>
            <p className="text-xl font-bold capitalize">
              {user?.subscription.tier || 'Free'}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-900/20 border-red-500/50">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}