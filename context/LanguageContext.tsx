import React, { createContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
    language: string;
    changeLanguage: (lng: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    changeLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem('@user_language');
            if (storedLanguage) {
                setLanguage(storedLanguage);
                i18n.changeLanguage(storedLanguage);
            }
        };

        loadLanguage();
    }, []);

    const changeLanguage = (lng: string) => {
        setLanguage(lng);
        i18n.changeLanguage(lng);
        AsyncStorage.setItem('@user_language', lng);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
