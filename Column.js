// ========================================
// Column - Represents a Kanban Column
// ========================================
class Column {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.cards = [];
        this.createdAt = new Date().toISOString();
    }

    addCard(card) {
        card.columnId = this.id;
        this.cards.push(card);
    }

    insertCardAt(card, index) {
        card.columnId = this.id;
        // Clamp index to valid range
        const targetIndex = Math.max(0, Math.min(index, this.cards.length));
        this.cards.splice(targetIndex, 0, card);
    }

    moveCard(cardId, newIndex) {
        const currentIndex = this.cards.findIndex(card => card.id === cardId);
        if (currentIndex === -1) return;

        const [card] = this.cards.splice(currentIndex, 1);
        const targetIndex = Math.max(0, Math.min(newIndex, this.cards.length));
        this.cards.splice(targetIndex, 0, card);
    }

    removeCard(cardId) {
        this.cards = this.cards.filter(card => card.id !== cardId);
    }

    getCard(cardId) {
        return this.cards.find(card => card.id === cardId);
    }

    render() {
        const columnEl = document.createElement('div');
        columnEl.className = 'column';
        columnEl.dataset.columnId = this.id;
        columnEl.draggable = true;

        const headerEl = document.createElement('div');
        headerEl.className = 'column-header';

        const titleEl = document.createElement('div');
        titleEl.className = 'column-title';
        titleEl.textContent = this.title;

        const countEl = document.createElement('div');
        countEl.className = 'column-count';
        countEl.textContent = this.cards.length;

        const actionsEl = document.createElement('div');
        actionsEl.className = 'column-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'column-btn delete';
        deleteBtn.textContent = '⋮';
        deleteBtn.title = 'Delete column';
        deleteBtn.dataset.action = 'delete';

        actionsEl.appendChild(deleteBtn);
        headerEl.appendChild(titleEl);
        headerEl.appendChild(countEl);
        headerEl.appendChild(actionsEl);

        const cardsListEl = document.createElement('div');
        cardsListEl.className = 'cards-list';

        this.cards.forEach(card => {
            cardsListEl.appendChild(card.render());
        });

        const addCardBtn = document.createElement('button');
        addCardBtn.className = 'add-card-btn';
        addCardBtn.textContent = '+ Add a card';
        addCardBtn.dataset.action = 'add-card';

        cardsListEl.appendChild(addCardBtn);

        columnEl.appendChild(headerEl);
        columnEl.appendChild(cardsListEl);

        return columnEl;
    }

    static fromJSON(json) {
        const column = new Column(json.id, json.title);
        column.cards = (json.cards || []).map(Card.fromJSON);
        column.createdAt = json.createdAt;
        return column;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            cards: this.cards.map(card => card.toJSON()),
            createdAt: this.createdAt
        };
    }
}
