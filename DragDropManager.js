// ========================================
// DragDropManager - Handles Drag Operations
// ========================================
class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedFromColumnId = null;

        this.onCardMove = null;
        this.onColumnSwap = null;
    }

    attachEventListeners(containerEl) {
        containerEl.addEventListener('dragstart', (e) => this.handleDragStart(e));
        containerEl.addEventListener('dragend', (e) => this.handleDragEnd(e));
        containerEl.addEventListener('dragover', (e) => this.handleDragOver(e));
        containerEl.addEventListener('drop', (e) => this.handleDrop(e));
        containerEl.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    handleDragStart(e) {
        this.draggedElement = e.target;

        if (this.draggedElement.classList.contains('card')) {
            this.draggedElement.classList.add('dragging');
            this.draggedFromColumnId = this.draggedElement.closest('.column').dataset.columnId;
            e.dataTransfer.effectAllowed = 'move';
        } else if (this.draggedElement.classList.contains('column')) {
            this.draggedElement.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragEnd(e) {
        document.querySelectorAll('.column.drag-over').forEach(col => {
            col.classList.remove('drag-over');
        });

        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this.draggedElement?.classList.contains('card')) {
            const cardsList = e.target.closest('.cards-list');
            if (cardsList) {
                const columnEl = cardsList.closest('.column');
                columnEl.classList.add('drag-over');
            }
        } else if (this.draggedElement?.classList.contains('column')) {
            const columnEl = e.target.closest('.column');
            if (columnEl && columnEl !== this.draggedElement) {
                columnEl.classList.add('drag-over');
            }
        }
    }

    handleDragLeave(e) {
        if (!e.target.closest('.column').contains(e.relatedTarget)) {
            e.target.closest('.column')?.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();

        if (this.draggedElement?.classList.contains('card')) {
            const targetColumn = e.target.closest('.column');
            if (targetColumn) {
                const cardId = this.draggedElement.dataset.cardId;
                const targetColumnId = targetColumn.dataset.columnId;

                if (this.draggedFromColumnId !== targetColumnId && this.onCardMove) {
                    this.onCardMove(cardId, this.draggedFromColumnId, targetColumnId);
                }
            }
            targetColumn?.classList.remove('drag-over');
        } else if (this.draggedElement?.classList.contains('column')) {
            const targetColumn = e.target.closest('.column');
            if (targetColumn && targetColumn !== this.draggedElement && this.onColumnSwap) {
                this.onColumnSwap(this.draggedElement.dataset.columnId, targetColumn.dataset.columnId);
            }
        }
    }
}
