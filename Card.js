// ========================================
// Card - Represents a Task Card
// ========================================
class Card {
    constructor(id, title, description = '', columnId = null) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.columnId = columnId;
        this.createdAt = new Date().toISOString();
        this.reminderAt = null;
    }

    render() {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.draggable = true;
        cardEl.dataset.cardId = this.id;

        const titleEl = document.createElement('div');
        titleEl.className = 'card-title';
        
        const titleText = document.createTextNode(this.title);
        titleEl.appendChild(titleText);
        
        // Add reminder indicator if card has a future reminder
        if (this.reminderAt) {
            const reminderDate = new Date(this.reminderAt);
            if (reminderDate > new Date()) {
                const reminderIcon = document.createElement('span');
                reminderIcon.className = 'reminder-icon';
                reminderIcon.textContent = '🔔';
                reminderIcon.title = `Reminder set for ${reminderDate.toLocaleString()}`;
                titleEl.appendChild(reminderIcon);
            }
        }
        
        cardEl.appendChild(titleEl);

        if (this.description) {
            const descEl = document.createElement('div');
            descEl.className = 'card-description';
            descEl.textContent = this.description;
            cardEl.appendChild(descEl);
        }

        const actionsEl = document.createElement('div');
        actionsEl.className = 'card-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'card-btn edit';
        editBtn.textContent = '✏️';
        editBtn.title = 'Edit card';
        editBtn.dataset.action = 'edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-btn delete';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Delete card';
        deleteBtn.dataset.action = 'delete';

        actionsEl.appendChild(editBtn);
        actionsEl.appendChild(deleteBtn);
        cardEl.appendChild(actionsEl);

        return cardEl;
    }

    static fromJSON(json) {
        const card = new Card(json.id, json.title, json.description, json.columnId);
        card.reminderAt = json.reminderAt || null;
        return card;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            columnId: this.columnId,
            createdAt: this.createdAt,
            reminderAt: this.reminderAt
        };
    }
}
