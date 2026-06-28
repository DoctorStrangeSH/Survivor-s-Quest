export class I18n {
    constructor() {
        this.locale = 'ru';
        this.translations = {};
        this.fallbackLocale = 'en';
    }

    async init() {
        try {
            // Загружаем переводы
            await this.loadLocale('ru');
            await this.loadLocale('en');
            
            // Определяем язык браузера
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'ru' || browserLang === 'en') {
                this.locale = browserLang;
            }
            
            console.log(`🌐 Language: ${this.locale}`);
            
            // Пытаемся загрузить сохраненный язык
            const saved = localStorage.getItem('game-language');
            if (saved && this.translations[saved]) {
                this.locale = saved;
            }
            
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.createFallbackTranslations();
        }
    }

    async loadLocale(locale) {
        try {
            // Пробуем загрузить из файла
            const response = await fetch(`js/locales/${locale}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.translations[locale] = await response.json();
            console.log(`✅ Loaded ${locale} translations`);
            
        } catch (error) {
            console.warn(`Failed to load ${locale}.json, using embedded translations`);
            // Если файл не загрузился, используем встроенные переводы
            this.translations[locale] = this.getEmbeddedTranslations(locale);
        }
    }

    getEmbeddedTranslations(locale) {
        // Встроенные переводы на случай, если файлы недоступны
        if (locale === 'ru') {
            return {
                game: { title: "Vampire Survivors Web" },
                ui: {
                    hp: "HP",
                    level: "УР",
                    exp: "ОПЫТ",
                    wave: "ВОЛНА",
                    time: "ВРЕМЯ",
                    kills: "УБИТО",
                    gold: "ЗОЛОТО"
                },
                levelup: {
                    title: "ПОВЫШЕНИЕ УРОВНЯ!",
                    subtitle: "Выберите улучшение"
                },
                death: {
                    title: "ВЫ ПОГИБЛИ",
                    playAgain: "ИГРАТЬ СНОВА"
                },
                weapons: {
                    whip: "Хлыст",
                    magic_wand: "Волшебная палочка",
                    garlic: "Чеснок",
                    fire_wand: "Огненный жезл",
                    king_bible: "Библия",
                    santa_water: "Святая вода",
                    lightning_ring: "Кольцо молний",
                    axe: "Топор",
                    cross: "Крест"
                },
                passives: {
                    spinach: "Шпинат",
                    armor: "Доспех",
                    hollow_heart: "Полое сердце",
                    empty_tome: "Пустой том",
                    candelabrador: "Канделябр",
                    duplicator: "Дубликатор",
                    attractorb: "Магнит"
                },
                enemies: {
                    bat: "Летучая мышь",
                    skeleton: "Скелет",
                    zombie: "Зомби",
                    ghost: "Призрак",
                    golem: "Голем",
                    boss: "БОСС"
                }
            };
        } else {
            return {
                game: { title: "Vampire Survivors Web" },
                ui: {
                    hp: "HP",
                    level: "LVL",
                    exp: "EXP",
                    wave: "WAVE",
                    time: "TIME",
                    kills: "KILLS",
                    gold: "GOLD"
                },
                levelup: {
                    title: "LEVEL UP!",
                    subtitle: "Choose an upgrade"
                },
                death: {
                    title: "YOU DIED",
                    playAgain: "PLAY AGAIN"
                },
                weapons: {
                    whip: "Whip",
                    magic_wand: "Magic Wand",
                    garlic: "Garlic",
                    fire_wand: "Fire Wand",
                    king_bible: "King Bible",
                    santa_water: "Santa Water",
                    lightning_ring: "Lightning Ring",
                    axe: "Axe",
                    cross: "Cross"
                },
                passives: {
                    spinach: "Spinach",
                    armor: "Armor",
                    hollow_heart: "Hollow Heart",
                    empty_tome: "Empty Tome",
                    candelabrador: "Candelabrador",
                    duplicator: "Duplicator",
                    attractorb: "Attractorb"
                },
                enemies: {
                    bat: "Bat",
                    skeleton: "Skeleton",
                    zombie: "Zombie",
                    ghost: "Ghost",
                    golem: "Golem",
                    boss: "BOSS"
                }
            };
        }
    }

    setLocale(locale) {
        if (this.translations[locale]) {
            this.locale = locale;
            localStorage.setItem('game-language', locale);
            this.updatePage();
            console.log(`🌐 Language changed to: ${locale}`);
        }
    }

    toggleLocale() {
        this.setLocale(this.locale === 'ru' ? 'en' : 'ru');
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.locale];
        
        // Ищем в текущем языке
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }
        
        // Fallback на английский
        if (typeof value !== 'string') {
            value = this.translations[this.fallbackLocale];
            for (const k of keys) {
                if (value && value[k] !== undefined) {
                    value = value[k];
                } else {
                    return key;
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
        // Обновление data-i18n элементов
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // Обновление placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // Эмит события для обновления UI
        document.dispatchEvent(new CustomEvent('localeChanged', {
            detail: { locale: this.locale }
        }));
    }

    getLocale() {
        return this.locale;
    }

    getAvailableLocales() {
        return Object.keys(this.translations);
    }
}