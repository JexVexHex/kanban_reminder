// ========================================
// registerReminderSW - PWA Service Worker registration (disabled by default)
// ========================================
function registerReminderSW(enabled = false) {
    if (!enabled || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw-reminders.stub.js").catch(console.error);
}
