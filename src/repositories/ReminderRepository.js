// ========================================
// ReminderRepository - Read/write reminders on cards
// ========================================
class ReminderRepository {
    constructor(cardStore) {
        this.cardStore = cardStore;
    }

    setReminder(cardId, whenISO) {
        const card = this.cardStore.getCardById(cardId);
        if (!card) return undefined;
        const updated = { ...card, reminderAt: whenISO };
        this.cardStore.saveCard(updated);
        return updated;
    }

    clearReminder(cardId) {
        const card = this.cardStore.getCardById(cardId);
        if (!card) return undefined;
        const updated = { ...card, reminderAt: null };
        this.cardStore.saveCard(updated);
        return updated;
    }

    cardsWithReminders() {
        return this.cardStore.getAllCards().filter(c => !!c.reminderAt);
    }
}
