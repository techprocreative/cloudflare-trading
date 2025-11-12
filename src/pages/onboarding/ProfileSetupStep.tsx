import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth-context';
import { OnboardingLayout } from '../../components/layouts/OnboardingLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
import { User, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface ProfileData {
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredMarkets: string[];
  investmentGoal: 'learning' | 'supplement' | 'primary';
}

export function ProfileSetupStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    riskProfile: 'moderate',
    experienceLevel: 'intermediate',
    preferredMarkets: [],
    investmentGoal: 'learning',
  });
  const [isSaving, setIsSaving] = useState(false);

  const questions = [
    {
      id: 'experience',
      title: t('onboarding.profile.experience.title'),
      subtitle: t('onboarding.profile.experience.subtitle'),
      icon: <User className="w-6 h-6" />,
      component: (
        <RadioGroup
          value={profileData.experienceLevel}
          onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
            setProfileData(prev => ({ ...prev, experienceLevel: value }))
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.experience.beginner')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.experience.beginnerDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.experience.intermediate')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.experience.intermediateDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.experience.advanced')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.experience.advancedDesc')}</div>
            </Label>
          </div>
        </RadioGroup>
      ),
    },
    {
      id: 'risk',
      title: t('onboarding.profile.risk.title'),
      subtitle: t('onboarding.profile.risk.subtitle'),
      icon: <Shield className="w-6 h-6" />,
      component: (
        <RadioGroup
          value={profileData.riskProfile}
          onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
            setProfileData(prev => ({ ...prev, riskProfile: value }))
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="conservative" id="conservative" />
            <Label htmlFor="conservative" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.risk.conservative')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.risk.conservativeDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="moderate" id="moderate" />
            <Label htmlFor="moderate" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.risk.moderate')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.risk.moderateDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="aggressive" id="aggressive" />
            <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.risk.aggressive')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.risk.aggressiveDesc')}</div>
            </Label>
          </div>
        </RadioGroup>
      ),
    },
    {
      id: 'markets',
      title: t('onboarding.profile.markets.title'),
      subtitle: t('onboarding.profile.markets.subtitle'),
      icon: <TrendingUp className="w-6 h-6" />,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'stocks', label: t('onboarding.profile.markets.stocks'), desc: t('onboarding.profile.markets.stocksDesc') },
              { id: 'forex', label: t('onboarding.profile.markets.forex'), desc: t('onboarding.profile.markets.forexDesc') },
              { id: 'crypto', label: t('onboarding.profile.markets.crypto'), desc: t('onboarding.profile.markets.cryptoDesc') },
            ].map((market) => (
              <div key={market.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={market.id}
                  checked={profileData.preferredMarkets.includes(market.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setProfileData(prev => ({
                        ...prev,
                        preferredMarkets: [...prev.preferredMarkets, market.id]
                      }));
                    } else {
                      setProfileData(prev => ({
                        ...prev,
                        preferredMarkets: prev.preferredMarkets.filter(m => m !== market.id)
                      }));
                    }
                  }}
                />
                <Label htmlFor={market.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{market.label}</div>
                  <div className="text-sm text-gray-500">{market.desc}</div>
                </Label>
              </div>
            ))}
          </div>
          {profileData.preferredMarkets.length === 0 && (
            <div className="text-sm text-gray-500 italic">
              {t('onboarding.profile.markets.selectAtLeastOne')}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'goal',
      title: t('onboarding.profile.goal.title'),
      subtitle: t('onboarding.profile.goal.subtitle'),
      icon: <AlertTriangle className="w-6 h-6" />,
      component: (
        <RadioGroup
          value={profileData.investmentGoal}
          onValueChange={(value: 'learning' | 'supplement' | 'primary') => 
            setProfileData(prev => ({ ...prev, investmentGoal: value }))
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="learning" id="learning" />
            <Label htmlFor="learning" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.goal.learning')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.goal.learningDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="supplement" id="supplement" />
            <Label htmlFor="supplement" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.goal.supplement')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.goal.supplementDesc')}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="primary" id="primary" />
            <Label htmlFor="primary" className="flex-1 cursor-pointer">
              <div className="font-medium">{t('onboarding.profile.goal.primary')}</div>
              <div className="text-sm text-gray-500">{t('onboarding.profile.goal.primaryDesc')}</div>
            </Label>
          </div>
        </RadioGroup>
      ),
    },
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Update user profile with onboarding data
      const updatedUser = {
        ...user,
        profile: {
          ...user!.profile,
          riskProfile: profileData.riskProfile,
          experienceLevel: profileData.experienceLevel,
          preferredMarkets: profileData.preferredMarkets,
          investmentGoal: profileData.investmentGoal,
        }
      };
      
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      localStorage.setItem('userHasCompletedOnboarding', 'true');
      await refreshUser();
      
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isQuestionValid = () => {
    switch (currentQ.id) {
      case 'markets':
        return profileData.preferredMarkets.length > 0;
      default:
        return true;
    }
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={3}
      showSkip={false}
      onSkip={() => handleComplete()}
      onBack={handlePrevious}
    >
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('onboarding.profile.questionProgress', { 
                current: currentQuestion + 1, 
                total: questions.length 
              })}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                {currentQ.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {currentQ.title}
            </CardTitle>
            <p className="text-gray-600">
              {currentQ.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            {currentQ.component}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <span>{t('common.previous')}</span>
          </Button>

          <div className="text-sm text-gray-500">
            {t('onboarding.profile.steps', { current: currentQuestion + 1, total: questions.length })}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isQuestionValid() || isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <span>
              {currentQuestion === questions.length - 1 
                ? t('onboarding.profile.complete') 
                : t('common.next')
              }
            </span>
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => handleComplete()}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSaving}
          >
            {t('onboarding.profile.skipAll')}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}