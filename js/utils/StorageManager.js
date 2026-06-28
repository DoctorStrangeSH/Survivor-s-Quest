export class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }

    static getRecord() {
        return this.load('survivor-record', 0);
    }

    static setRecord(kills) {
        const current = this.getRecord();
        if (kills > current) {
            this.save('survivor-record', kills);
            return true;
        }
        return false;
    }
}