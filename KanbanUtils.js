// ========================================
// KanbanUtils - Utility Functions
// ========================================
class KanbanUtils {
    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// ========================================
// Initialize Application
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new KanbanBoard();
});
