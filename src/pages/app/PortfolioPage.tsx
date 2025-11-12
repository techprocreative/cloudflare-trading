import { useTranslation } from 'react-i18next';
import { PieChart, Lock } from 'lucide-react';

export function PortfolioPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full p-4 md:p-6">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <PieChart className="h-16 w-16 text-gray-400 mb-4" />
          <Lock className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{t('nav.portfolio')}</h2>
        <p className="text-gray-400 text-center max-w-md mb-2">
          Portfolio tracking and management will be displayed here. This feature is available for Premium users.
        </p>
        <p className="text-yellow-500 text-sm">
          Upgrade to Premium to unlock this feature
        </p>
      </div>
    </div>
  );
}