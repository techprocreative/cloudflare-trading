import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu, X, CreditCard, FileText, Shield, User, LogOut, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
      {
        to: '/',
        label: t('nav.home'),
        icon: Home,
      },
      {
        to: '/pricing',
        label: t('nav.pricing'),
        icon: CreditCard,
      },
      {
        to: '/terms',
        label: t('legal.termsOfService'),
        icon: FileText,
      },
      {
        to: '/privacy',
        label: t('legal.privacyPolicy'),
        icon: Shield,
      },
    ];
  
    const isActiveLink = (path: string) => {
      return location.pathname === path;
    };
  
    const handleSignOut = () => {
      signOut();
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    };
  
    const getUserInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
  
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-400 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="hidden sm:block">Signal Sage AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveLink(link.to)
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <LanguageSwitcher />
                            <ThemeToggle />
                          </div>
                          <div className="flex items-center space-x-2">
                            {isAuthenticated && user ? (
                              // Authenticated user menu
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                                        {getUserInitials(user.user.fullName || user.user.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
                                  <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                      <p className="text-sm font-medium leading-none text-white">
                                        {user.user.fullName || 'User'}
                                      </p>
                                      <p className="text-xs leading-none text-gray-400">
                                        {user.user.email}
                                      </p>
                                    </div>
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                                    <Link to="/app/settings">
                                      <User className="mr-2 h-4 w-4" />
                                      <span>{t('nav.profile')}</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                                    <Link to="/app/settings">
                                      <span>{t('nav.settings')}</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-gray-700" />
                                  <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t('auth.signOut')}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              // Guest user buttons - Fixed the asChild usage
                              <div className="flex items-center space-x-2">
                                <Link to="/login">
                                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                                    {t('auth.signIn')}
                                  </Button>
                                </Link>
                                <Link to="/register">
                                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    {t('auth.signUp')}
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActiveLink(link.to)
                          ? 'text-blue-400 bg-blue-400/10'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
                            <div className="border-t border-gray-800 pt-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{t('common.language')}</span>
                                <LanguageSwitcher />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{t('common.theme')}</span>
                                <ThemeToggle />
                              </div>
                              
                              {isAuthenticated && user ? (
                                // Authenticated mobile menu
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-700 rounded-md">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                                        {getUserInitials(user.user.fullName || user.user.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-white">
                                        {user.user.fullName || 'User'}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {user.user.email}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Link to="/app/settings" onClick={() => setIsMobileMenuOpen(false)}>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                                      >
                                        <User className="mr-2 h-4 w-4" />
                                        {t('nav.profile')}
                                      </Button>
                                    </Link>
                                    <Link to="/app/settings" onClick={() => setIsMobileMenuOpen(false)}>
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                                      >
                                        {t('nav.settings')}
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      onClick={() => {
                                        handleSignOut();
                                        setIsMobileMenuOpen(false);
                                      }}
                                    >
                                      <LogOut className="mr-2 h-4 w-4" />
                                      {t('auth.signOut')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Guest mobile menu - Fixed the asChild usage
                                <div className="grid grid-cols-2 gap-3">
                                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
                                      {t('auth.signIn')}
                                    </Button>
                                  </Link>
                                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                      {t('auth.signUp')}
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-white mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SS</span>
                </div>
                <span>Signal Sage AI</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                {t('landing.footer.tagline')}
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.twitter')}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.linkedin')}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.github')}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.links.support')}</h4>
              <div className="space-y-2">
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  {t('legal.termsOfService')}
                </Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  {t('legal.privacyPolicy')}
                </Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  {t('nav.pricing')}
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.links.about')}</h4>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  {t('landing.footer.links.contact')}
                </Link>
                <Link to="/support" className="block text-gray-400 hover:text-white transition-colors">
                  {t('landing.footer.links.support')}
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  {t('landing.footer.links.careers')}
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              {t('landing.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}