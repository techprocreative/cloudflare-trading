import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Disclaimer() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenDisclaimer');
    setHasSeenDisclaimer(!!hasSeen);
    setIsVisible(!hasSeen);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setHasSeenDisclaimer(true);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (hasSeenDisclaimer || !isVisible) {
    return null;
  }

  // Safe translation function that returns fallback text if translation is missing
  const safeT = (key: string, fallback: string) => {
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-lg rounded-lg border border-yellow-500/30 bg-gray-900/95 p-6 text-yellow-200 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-yellow-400" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-300">
              {safeT('legal.educationalOnly', 'Educational Purpose Only')}
            </h3>
            <div className="mt-3 space-y-3">
              <p className="text-sm leading-relaxed">
                {safeT('legal.disclaimerText', 'This platform is for educational purposes only.')}
              </p>
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-xs font-medium text-yellow-300">
                  {safeT('legal.notFinancialAdvice', 'Not Financial Advice')}
                </p>
              </div>
              <p className="text-xs leading-relaxed">
                {safeT('legal.complianceText', 'Please consult a financial advisor before making investment decisions.')}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAccept}
                className="flex-1 bg-yellow-600 text-gray-900 hover:bg-yellow-500"
              >
                I Understand & Accept
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
              >
                Learn More
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-yellow-400 hover:text-yellow-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}