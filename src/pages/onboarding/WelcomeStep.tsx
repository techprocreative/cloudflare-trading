import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { OnboardingLayout } from '../../components/layouts/OnboardingLayout';
import { Button } from '../../components/ui/button';
import { CheckCircle, TrendingUp, Shield, Bot, BarChart3 } from 'lucide-react';

export function WelcomeStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate('/onboarding/plan');
  };

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: t('onboarding.welcome.features.ai.title'),
      description: t('onboarding.welcome.features.ai.description'),
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('onboarding.welcome.features.signals.title'),
      description: t('onboarding.welcome.features.signals.description'),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('onboarding.welcome.features.security.title'),
      description: t('onboarding.welcome.features.security.description'),
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('onboarding.welcome.features.analytics.title'),
      description: t('onboarding.welcome.features.analytics.description'),
    },
  ];

  const userName = user?.user?.fullName || t('onboarding.welcome.user');

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={3}
      showSkip={true}
      onSkip={() => navigate('/onboarding/plan')}
      onBack={() => navigate('/login')}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('onboarding.welcome.title', { name: userName })}
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            {t('onboarding.welcome.subtitle')}
          </p>
          
          <p className="text-lg text-gray-500">
            {t('onboarding.welcome.description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {t('onboarding.welcome.cta')}
          </Button>
          
          <p className="text-sm text-gray-500">
            {t('onboarding.welcome.estimate')}
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}