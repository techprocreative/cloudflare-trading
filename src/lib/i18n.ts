import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
import enTranslation from '../locales/en/translation.json';
import idTranslation from '../locales/id/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  id: {
    translation: idTranslation
  }
};

// Initialize i18n with proper configuration
const initI18n = async () => {
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // Default to English
      fallbackLng: 'en',
      
      interpolation: {
        escapeValue: false,
      },
      
      // Detection options
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      
      // Debug mode (always enabled for troubleshooting)
      debug: true,
      
      // Prevent undefined translations from causing errors
      returnEmptyString: false,
      
      // React-specific options
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: '',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'p', 'span'],
      },
    });
};

// Initialize on module load
initI18n().catch((error) => {
  console.error('Failed to initialize i18n:', error);
});

export default i18n;
