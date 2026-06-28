export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.active = [];
        
        // Предварительное создание объектов
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    // Получить объект из пула
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.createFn();
        }
        this.resetFn(obj);
        this.active.push(obj);
        return obj;
    }

    // Вернуть объект в пул
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }

    // Освободить все объекты
    releaseAll() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }

    // Получить все активные объекты
    getActive() {
        return this.active;
    }

    // Количество активных объектов
    getActiveCount() {
        return this.active.length;
    }

    // Количество свободных объектов
    getFreeCount() {
        return this.pool.length;
    }

    // Очистить пул полностью
    clear() {
        this.pool = [];
        this.active = [];
    }
}