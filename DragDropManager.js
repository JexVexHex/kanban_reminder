// ========================================
// DragDropManager - Handles Drag Operations
// ========================================
class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedFromColumnId = null;
        this.dropIndicator = null;

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

        this.removeDropIndicator();
    }

    createDropIndicator() {
        if (!this.dropIndicator) {
            this.dropIndicator = document.createElement('div');
            this.dropIndicator.className = 'drop-indicator';
        }
        return this.dropIndicator;
    }

    removeDropIndicator() {
        if (this.dropIndicator && this.dropIndicator.parentNode) {
            this.dropIndicator.parentNode.removeChild(this.dropIndicator);
        }
    }

    getCardDropPosition(cardsList, clientY) {
        const cards = Array.from(cardsList.querySelectorAll('.card:not(.dragging)'));

        if (cards.length === 0) {
            return { index: 0, beforeCard: null };
        }

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const rect = card.getBoundingClientRect();
            const cardMiddle = rect.top + rect.height / 2;

            if (clientY < cardMiddle) {
                return { index: i, beforeCard: card };
            }
        }

        // Drop at the end
        return { index: cards.length, beforeCard: null };
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (this.draggedElement?.classList.contains('card')) {
            const cardsList = e.target.closest('.cards-list');
            if (cardsList) {
                const columnEl = cardsList.closest('.column');
                columnEl.classList.add('drag-over');

                // Show drop indicator
                const dropPosition = this.getCardDropPosition(cardsList, e.clientY);
                const indicator = this.createDropIndicator();

                if (dropPosition.beforeCard) {
                    cardsList.insertBefore(indicator, dropPosition.beforeCard);
                } else {
                    // Insert before the "Add card" button
                    const addCardBtn = cardsList.querySelector('.add-card-btn');
                    if (addCardBtn) {
                        cardsList.insertBefore(indicator, addCardBtn);
                    } else {
                        cardsList.appendChild(indicator);
                    }
                }
            }
        } else if (this.draggedElement?.classList.contains('column')) {
            const columnEl = e.target.closest('.column');
            if (columnEl && columnEl !== this.draggedElement) {
                columnEl.classList.add('drag-over');
            }
        }
    }

    handleDragLeave(e) {
        const columnEl = e.target.closest('.column');
        if (!columnEl) return;
        const related = e.relatedTarget;
        if (!related || !columnEl.contains(related)) {
            columnEl.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();

        if (this.draggedElement?.classList.contains('card')) {
            const cardsList = e.target.closest('.cards-list');
            if (cardsList) {
                const targetColumn = cardsList.closest('.column');
                const cardId = this.draggedElement.dataset.cardId;
                const targetColumnId = targetColumn.dataset.columnId;

                // Calculate the drop position
                const dropPosition = this.getCardDropPosition(cardsList, e.clientY);

                if (this.onCardMove) {
                    this.onCardMove(cardId, this.draggedFromColumnId, targetColumnId, dropPosition.index);
                }

                targetColumn.classList.remove('drag-over');
            }
        } else if (this.draggedElement?.classList.contains('column')) {
            const targetColumn = e.target.closest('.column');
            if (targetColumn && targetColumn !== this.draggedElement && this.onColumnSwap) {
                this.onColumnSwap(this.draggedElement.dataset.columnId, targetColumn.dataset.columnId);
            }
        }

        this.removeDropIndicator();
    }
}
