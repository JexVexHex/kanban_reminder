// ========================================
// ReminderCoordinator - Wires reminder events to UI
// ========================================
class ReminderCoordinator {
    constructor(manager, notifier, locator) {
        this.manager = manager;
        this.notifier = notifier;
        this.locator = locator;
    }

    async start() {
        await this.manager.init();
    }

    handleDue = (cardId) => {
        const title = this.locator.getTitle(cardId) || "Card";
        this.notifier.notify({
            title: `Reminder: ${title}`,
            body: "Due now",
            tag: `reminder-${cardId}`,
            onClick: () => {
                window.focus();
                this.locator.scrollToCard(cardId);
                this.locator.highlight(cardId);
            }
        });
    };
}
