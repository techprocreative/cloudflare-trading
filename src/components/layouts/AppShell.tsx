import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  MessageSquare,
  TrendingUp,
  PieChart,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  CreditCard,
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AppBottomNav } from '@/components/AppBottomNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

// Navigation items
const navigationItems = [
  {
    title: 'nav.dashboard',
    href: '/app/dashboard',
    icon: Home,
  },
  {
    title: 'nav.chat',
    href: '/app/chat',
    icon: MessageSquare,
  },
  {
    title: 'signals.title',
    href: '/app/signals',
    icon: TrendingUp,
  },
  {
    title: 'nav.courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'nav.articles',
    href: '/articles',
    icon: Newspaper,
  },
  {
    title: 'nav.portfolio',
    href: '/app/portfolio',
    icon: PieChart,
    badge: 'pro', // Indicates this is a pro feature
  },
  {
    title: 'nav.settings',
    href: '/app/settings',
    icon: Settings,
  },
];

export function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock user data - replace with real auth context later
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    tier: 'premium' as 'free' | 'basic' | 'premium' | 'pro',
  };

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-950">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
          <Link to="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-white">Signal Sage</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile User Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium">{user.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full capitalize",
                    user.tier === 'free' && "bg-gray-700 text-gray-300",
                    user.tier === 'basic' && "bg-blue-700 text-blue-200",
                    user.tier === 'premium' && "bg-purple-700 text-purple-200",
                    user.tier === 'pro' && "bg-gold-700 text-yellow-200"
                  )}>
                    {user.tier}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <Link to="/app/profile" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                <User className="h-4 w-4" />
                <span>{t('nav.profile')}</span>
              </Link>
              <Link to="/app/settings" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                <Settings className="h-4 w-4" />
                <span>{t('nav.settings')}</span>
              </Link>
              <Link to="/pricing" className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md">
                <CreditCard className="h-4 w-4" />
                <span>{t('nav.subscription')}</span>
              </Link>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md w-full text-left">
                <LogOut className="h-4 w-4" />
                <span>{t('auth.signOut')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <div>
                <h1 className="font-bold text-white">Signal Sage AI</h1>
                <p className="text-xs text-gray-400">Trading Platform</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600/10 text-blue-400 border-r-2 border-blue-400"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{t(item.title)}</span>
                    {item.badge && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Pro Feature"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                New Signal
              </Button>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-gray-800 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full capitalize",
                    user.tier === 'free' && "bg-gray-700 text-gray-300",
                    user.tier === 'basic' && "bg-blue-700 text-blue-200",
                    user.tier === 'premium' && "bg-purple-700 text-purple-200",
                    user.tier === 'pro' && "bg-yellow-700 text-yellow-200"
                  )}>
                    {user.tier}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="hover:bg-gray-800">
                  <Link to="/app/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-800">
                  <Link to="/app/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gray-800">
                  <Link to="/pricing" className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>{t('nav.subscription')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('auth.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Breadcrumbs className="hidden md:flex" />
            <h2 className="text-lg font-semibold text-white md:hidden">
              {t(`nav.${location.pathname.split('/')[2]}`) || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}