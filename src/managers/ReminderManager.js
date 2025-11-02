// ========================================
// ReminderManager - Orchestrates reminder operations
// ========================================
class ReminderManager {
    constructor(repo, scheduler, notifier, toastService) {
        this.repo = repo;
        this.scheduler = scheduler;
        this.notifier = notifier;
        this.toastService = toastService;
    }

    async init() {
        const reminders = this.repo.cardsWithReminders().map(c => ({
            cardId: c.id,
            whenISO: c.reminderAt
        }));
        this.scheduler.reload(reminders);
    }

    async setReminder(cardId, whenISO) {
        const permission = await this.notifier.ensurePermission();
        this.repo.setReminder(cardId, whenISO);
        this.scheduler.remove(cardId);
        this.scheduler.add(cardId, new Date(whenISO).getTime());
        if (!permission) {
            this.toastService.show("Browser notifications are blocked. The reminder will appear in-app.");
        }
    }

    clearReminder(cardId) {
        this.repo.clearReminder(cardId);
        this.scheduler.remove(cardId);
    }
}
