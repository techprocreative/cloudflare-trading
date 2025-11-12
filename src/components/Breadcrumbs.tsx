import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

// Route mapping for breadcrumb titles
const routeTitles = {
  '/': 'nav.home',
  '/app': 'nav.dashboard',
  '/app/dashboard': 'nav.dashboard',
  '/app/chat': 'nav.chat',
  '/app/signals': 'signals.title',
  '/app/portfolio': 'nav.portfolio',
  '/app/settings': 'nav.settings',
  '/app/profile': 'nav.profile',
  '/pricing': 'nav.pricing',
  '/terms': 'legal.termsOfService',
  '/privacy': 'legal.privacyPolicy',
  '/login': 'auth.signIn',
  '/register': 'auth.signUp',
  '/onboarding': 'onboarding.title',
  '/onboarding/welcome': 'onboarding.welcome.title',
  '/onboarding/plan': 'onboarding.plan.title',
  '/onboarding/profile': 'onboarding.profile.title',
  '/checkout': 'payment.checkout.title',
};

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast?: boolean;
}

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ className, showHome = true }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home link if enabled and not on home page
    if (showHome && location.pathname !== '/') {
      breadcrumbs.push({
        label: t('nav.home'),
        href: '/',
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Get translated title for this segment
      const titleKey = routeTitles[currentPath as keyof typeof routeTitles] || 
        routeTitles[`/${segment}` as keyof typeof routeTitles];
      
      const label = titleKey ? t(titleKey) : 
        segment.charAt(0).toUpperCase() + segment.slice(1);

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if only one item or empty
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm text-gray-400", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.href || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 mx-1 text-gray-600" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className={cn(
                  "hover:text-white transition-colors duration-200",
                  "flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-800/50"
                )}
              >
                {showHome && index === 0 && (
                  <Home className="h-3 w-3" />
                )}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span 
                className={cn(
                  "text-white font-medium",
                  "flex items-center space-x-1 px-2 py-1"
                )}
              >
                {showHome && index === 0 && (
                  <Home className="h-3 w-3" />
                )}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}