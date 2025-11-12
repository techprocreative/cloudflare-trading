import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full p-4 md:p-6">
      <div className="flex flex-col items-center justify-center h-full">
        <Settings className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{t('nav.settings')}</h2>
        <p className="text-gray-400 text-center max-w-md">
          Account settings, preferences, and configuration options will be displayed here. This page is coming soon in Phase 2.
        </p>
      </div>
    </div>
  );
}