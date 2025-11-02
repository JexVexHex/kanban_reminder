// ========================================
// CardReminderViewModel - UI-facing reminder logic
// ========================================
class CardReminderViewModel {
    constructor(manager, cardId) {
        this.manager = manager;
        this.cardId = cardId;
    }

    setFromInput(value) {
        if (!value) {
            this.manager.clearReminder(this.cardId);
            return;
        }
        const iso = new Date(value).toISOString();
        this.manager.setReminder(this.cardId, iso);
    }

    inputValueFromCard(card) {
        if (!card || !card.reminderAt) return "";
        return new Date(card.reminderAt).toISOString().slice(0, 16);
    }
}
