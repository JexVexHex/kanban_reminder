// ========================================
// ReminderScheduler - Single timer queue for reminders
// ========================================
class ReminderScheduler {
    constructor(onDue) {
        this.onDue = onDue;
        this.queue = [];
        this.timerId = null;
    }

    reload(reminders) {
        this.clear();
        for (const r of reminders) {
            this.add(r.cardId, new Date(r.whenISO).getTime());
        }
        this.armNext();
    }

    add(cardId, whenEpochMs) {
        this.queue.push({ cardId, when: whenEpochMs });
        this.queue.sort((a, b) => a.when - b.when);
        this.armNext();
    }

    remove(cardId) {
        this.queue = this.queue.filter(r => r.cardId !== cardId);
        this.armNext();
    }

    clear() {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.queue = [];
    }

    armNext() {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        const next = this.queue[0];
        if (!next) return;
        const delay = Math.max(0, next.when - Date.now());
        this.timerId = window.setTimeout(() => {
            const now = Date.now();
            const due = [];
            while (this.queue.length && this.queue[0].when <= now) {
                due.push(this.queue.shift());
            }
            for (const d of due) {
                this.onDue(d.cardId);
            }
            this.armNext();
        }, delay);
    }
}
