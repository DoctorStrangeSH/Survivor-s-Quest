export class I18n {
    constructor() {
        this.locale = 'ru';
        this.translations = {};
        this.fallbackLocale = 'en';
    }

    async init() {
        try {
            // Загружаем оба языка
            await this.loadLocale('ru');
            await this.loadLocale('en');
            
            // Определяем язык браузера
            const browserLang = navigator.language.split('-')[0];
            if (['ru', 'en'].includes(browserLang)) {
                this.locale = browserLang;
            }
            
            console.log(`🌐 Locale set to: ${this.locale}`);
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Создаем базовые переводы, если файлы не загрузились
            this.createFallbackTranslations();
        }
    }

    async loadLocale(locale) {
        try {
            const response = await fetch(`js/locales/${locale}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            this.translations[locale] = await response.json();
        } catch (error) {
            console.warn(`Failed to load locale ${locale}:`, error);
            // Создаем пустой объект, чтобы не сломать логику
            this.translations[locale] = {};
        }
    }

    createFallbackTranslations() {
        // Минимальные переводы, если JSON файлы недоступны
        this.translations = {
            ru: {
                game: { title: "Survivor's Quest — Выживи!" },
                menu: { 
                    language: "Выберите язык / Select Language",
                    pause: "ПАУЗА",
                    continue: "ПРОДОЛЖИТЬ",
                    restart: "ЗАНОВО"
                },
                ui: {
                    hp: "HP",
                    level: "LVL",
                    exp: "EXP",
                    gold: "💰",
                    kills: "⚔️",
                    time: "⏱",
                    wave: "🌊"
                },
                death: {
                    title: "ТЫ ПОГИБ",
                    kills: "Убито",
                    time: "Время",
                    gold: "Золото",
                    record: "Рекорд",
                    wave: "Волна",
                    playAgain: "ИГРАТЬ СНОВА"
                }
            },
            en: {
                game: { title: "Survivor's Quest - Survive!" },
                menu: {
                    language: "Select Language / Выберите язык",
                    pause: "PAUSE",
                    continue: "CONTINUE",
                    restart: "RESTART"
                },
                ui: {
                    hp: "HP",
                    level: "LVL",
                    exp: "EXP",
                    gold: "💰",
                    kills: "⚔️",
                    time: "⏱",
                    wave: "🌊"
                },
                death: {
                    title: "YOU DIED",
                    kills: "Kills",
                    time: "Time",
                    gold: "Gold",
                    record: "Record",
                    wave: "Wave",
                    playAgain: "PLAY AGAIN"
                }
            }
        };
    }

    setLocale(locale) {
        if (this.translations[locale]) {
            this.locale = locale;
            this.updatePage();
            console.log(`🌐 Locale changed to: ${locale}`);
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
                value = undefined;
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
                    value = undefined;
                    break;
                }
            }
        }
        
        // Если перевода нет, возвращаем ключ
        if (typeof value !== 'string') {
            return key;
        }
        
        // Замена параметров
        if (params) {
            Object.keys(params).forEach(param => {
                value = value.replace(`{${param}}`, params[param]);
            });
        }
        
        return value;
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