import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Shield, Smartphone, Star, ArrowRight } from 'lucide-react';

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Day Trader',
    content: 'Signal Sage AI has transformed my trading strategy. The AI-powered signals are incredibly accurate.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Investment Advisor',
    content: 'The risk management features and real-time analysis help my clients make better decisions.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    role: 'Crypto Trader',
    content: 'Outstanding platform! The mobile interface is perfect for trading on the go.',
    rating: 5,
  },
];

const featureCards = [
  {
    icon: Brain,
    key: 'aiAnalysis',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    key: 'realTimeData',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    key: 'riskManagement',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Smartphone,
    key: 'mobileApp',
    gradient: 'from-orange-500 to-red-500',
  },
];

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                  {t('landing.hero.cta')}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg">
                  {t('landing.hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gray-900/80 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      {t(`landing.features.${feature.key}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-center">
                      {t(`landing.features.${feature.key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg text-gray-400">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-gray-900/80 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              {t('landing.pricing.subtitle')}
            </p>
            <Link to="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <div className="flex items-center gap-2">
                  {t('landing.pricing.viewAllPlans')}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Signal Sage AI</h3>
              <p className="text-gray-400 mb-6">
                {t('landing.footer.tagline')}
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.twitter')}</span>
                  X
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.linkedin')}</span>
                  in
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <span className="sr-only">{t('landing.footer.social.github')}</span>
                  gh
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.links.support')}</h4>
              <div className="space-y-2">
                <Link to="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  {t('legal.termsOfService')}
                </Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  {t('legal.privacyPolicy')}
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">{t('landing.footer.links.contact')}</h4>
              <div className="space-y-2">
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  {t('nav.pricing')}
                </Link>
              </div>
            </div>
          </div>
          
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