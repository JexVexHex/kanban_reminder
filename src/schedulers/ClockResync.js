// ========================================
// ClockResync - Reschedules on visibility/time drift
// ========================================
class ClockResync {
    constructor(resync) {
        this.resync = resync;
        this.lastCheck = Date.now();
        this.id = null;
    }

    start() {
        this.id = window.setInterval(() => {
            const now = Date.now();
            if (Math.abs(now - this.lastCheck - 60000) > 5000) {
                this.resync();
            }
            this.lastCheck = now;
        }, 60000);

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                this.resync();
            }
        });
    }

    stop() {
        if (this.id) {
            clearInterval(this.id);
        }
    }
}
