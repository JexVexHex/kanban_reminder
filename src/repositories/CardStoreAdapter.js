// ========================================
// CardStoreAdapter - Adapts KanbanBoard columns to CardStore interface
// ========================================
class CardStoreAdapter {
    constructor(kanbanBoard) {
        this.kanbanBoard = kanbanBoard;
    }

    getCardById(cardId) {
        for (const column of this.kanbanBoard.columns) {
            const card = column.getCard(cardId);
            if (card) return card;
        }
        return undefined;
    }

    saveCard(card) {
        // Find the column and update the card
        for (const column of this.kanbanBoard.columns) {
            const existingCard = column.getCard(card.id);
            if (existingCard) {
                // Update the card in place
                existingCard.title = card.title;
                existingCard.description = card.description;
                existingCard.columnId = card.columnId;
                existingCard.reminderAt = card.reminderAt;
                this.kanbanBoard.save();
                return;
            }
        }
    }

    getAllCards() {
        const cards = [];
        for (const column of this.kanbanBoard.columns) {
            cards.push(...column.cards);
        }
        return cards;
    }
}
