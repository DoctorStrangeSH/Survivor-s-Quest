export class I18n {
    constructor() {
        this.locale = 'ru';
        this.translations = {};
        this.fallbackLocale = 'en';
    }

    async init() {
        // Загружаем оба языка
        await this.loadLocale('ru');
        await this.loadLocale('en');
        
        // Определяем язык браузера
        const browserLang = navigator.language.split('-')[0];
        if (['ru', 'en'].includes(browserLang)) {
            this.locale = browserLang;
        }
    }

    async loadLocale(locale) {
        try {
            const response = await fetch(`js/locales/${locale}.json`);
            this.translations[locale] = await response.json();
        } catch (error) {
            console.error(`Failed to load locale: ${locale}`, error);
        }
    }

    setLocale(locale) {
        if (this.translations[locale]) {
            this.locale = locale;
            this.updatePage();
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.locale];
        
        // Пытаемся найти в текущем языке
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                break;
            }
        }
        
        // Если не нашли, ищем в fallback языке
        if (typeof value !== 'string') {
            value = this.translations[this.fallbackLocale];
            for (const k of keys) {
                if (value && value[k] !== undefined) {
                    value = value[k];
                } else {
                    return key; // Возвращаем ключ, если перевод не найден
                }
            }
        }
        
        // Замена параметров
        if (typeof value === 'string' && params) {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value || key;
    }

    updatePage() {
        // Обновляем все элементы с data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // Эмиттим событие для обновления динамического контента
        document.dispatchEvent(new CustomEvent('localeChanged', {
            detail: { locale: this.locale }
        }));
    }
}