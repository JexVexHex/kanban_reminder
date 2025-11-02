// ========================================
// StorageManager - Handles Local Storage
// ========================================
class StorageManager {
    constructor(storageKey = 'kanban-board-data') {
        this.storageKey = storageKey;
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }
}
