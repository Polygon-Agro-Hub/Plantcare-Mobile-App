import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/english.json';
import ta from './translations/tamil.json';
import si from './translations/sinhala.json';

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ta: { translation: ta },
        si: { translation: si },
    },
    lng: 'en', 
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
