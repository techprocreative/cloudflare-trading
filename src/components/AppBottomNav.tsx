import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  PieChart, 
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Navigation items for bottom navigation
const bottomNavItems = [
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
    title: 'nav.portfolio',
    href: '/app/portfolio',
    icon: PieChart,
    badge: 'premium', // Premium feature
  },
  {
    title: 'nav.settings',
    href: '/app/settings',
    icon: Settings,
  },
];

interface AppBottomNavProps {
  className?: string;
}

export function AppBottomNav({ className }: AppBottomNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show on scroll functionality
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const getUserTier = () => {
    if (!user?.subscription) return 'free';
    return user.subscription.tier;
  };

  const userTier = getUserTier();

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80 transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.href);
          
          // Check if this is a premium feature and user doesn't have access
          const isPremiumFeature = item.badge === 'premium';
          const hasPremiumAccess = userTier === 'pro' || userTier === 'premium';
          const shouldShowLock = isPremiumFeature && !hasPremiumAccess;
          
          return (
            <Link
              key={item.href}
              to={shouldShowLock ? '/pricing' : item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-2 px-1 text-xs transition-all duration-200 relative",
                isActive && !shouldShowLock
                  ? "text-blue-400 transform -translate-y-0.5"
                  : "text-gray-400 hover:text-white",
                shouldShowLock && "opacity-50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 mb-1 transition-transform duration-200",
                  isActive && !shouldShowLock ? "scale-110" : ""
                )} />
                
                {/* Badge indicators */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                )}
                
                {/* Lock icon for premium features */}
                {shouldShowLock && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Notification dot */}
                {item.href === '/app/chat' && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive && !shouldShowLock ? "font-semibold" : ""
              )}>
                {t(item.title)}
              </span>
              
              {/* Active indicator dot */}
              {isActive && !shouldShowLock && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}