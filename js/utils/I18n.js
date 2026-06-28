export class I18n {
    constructor() {
        this.locale = 'ru';
        this.translations = {};
        this.fallbackLocale = 'en';
    }

    async init() {
        try {
            // Загружаем оба языка из JSON файлов
            await this.loadLocale('ru');
            await this.loadLocale('en');
            
            // Проверяем сохраненный язык
            const saved = localStorage.getItem('game-language');
            if (saved && this.translations[saved]) {
                this.locale = saved;
            } else {
                // Определяем язык браузера
                const browserLang = navigator.language.split('-')[0];
                if (['ru', 'en'].includes(browserLang)) {
                    this.locale = browserLang;
                }
            }
            
            console.log(`🌐 Language loaded: ${this.locale}`);
        } catch (error) {
            console.error('❌ Failed to load translations:', error);
        }
    }

    async loadLocale(locale) {
        try {
            const response = await fetch(`js/locales/${locale}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            this.translations[locale] = await response.json();
            console.log(`✅ Loaded ${locale}.json`);
        } catch (error) {
            console.error(`❌ Failed to load ${locale}.json:`, error);
            // Создаем пустой объект чтобы не сломать логику
            this.translations[locale] = {};
        }
    }

    setLocale(locale) {
        if (this.translations[locale] && Object.keys(this.translations[locale]).length > 0) {
            this.locale = locale;
            localStorage.setItem('game-language', locale);
            
            // Вызываем событие для обновления UI
            document.dispatchEvent(new CustomEvent('localeChanged', { 
                detail: { locale } 
            }));
            
            console.log(`🌐 Language changed to: ${locale}`);
        } else {
            console.warn(`⚠️ Locale ${locale} not available`);
        }
    }

    toggleLocale() {
        const newLocale = this.locale === 'ru' ? 'en' : 'ru';
        this.setLocale(newLocale);
    }

    t(key, params = {}) {
        if (!key) return '';
        
        const keys = key.split('.');
        let value = this.translations[this.locale];
        
        // Ищем в текущем языке
        for (const k of keys) {
            if (value && typeof value === 'object' && value[k] !== undefined) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }
        
        // Если не нашли - ищем в fallback языке
        if (typeof value !== 'string') {
            value = this.translations[this.fallbackLocale];
            if (value) {
                for (const k of keys) {
                    if (value && typeof value === 'object' && value[k] !== undefined) {
                        value = value[k];
                    } else {
                        value = undefined;
                        break;
                    }
                }
            }
        }
        
        // Если перевода нет совсем - возвращаем ключ
        if (typeof value !== 'string') {
            console.warn(`⚠️ Missing translation: ${key}`);
            return key;
        }
        
        // Замена параметров {param}
        if (params && typeof value === 'string') {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value;
    }

    getLocale() {
        return this.locale;
    }
}