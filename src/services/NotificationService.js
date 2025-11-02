// ========================================
// NotificationService - Wraps Web Notifications API
// ========================================
class NotificationService {
    async ensurePermission() {
        if (!("Notification" in window)) return false;
        if (Notification.permission === "granted") return true;
        if (Notification.permission === "denied") return false;
        const result = await Notification.requestPermission();
        return result === "granted";
    }

    canNotify() {
        return "Notification" in window && Notification.permission === "granted";
    }

    notify({ title, body, tag, onClick }) {
        if (!this.canNotify()) return;
        const n = new Notification(title, { body, tag });
        if (onClick) n.addEventListener("click", () => onClick());
    }
}
