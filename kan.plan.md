<!-- ab37146f-5d84-4a09-a7ed-cf942c872b62 b589c980-ffa0-4a25-b788-5e469a4ff340 -->
# Kanban Reminders (Plain JS/TS, in-tab notifications)

## Overview

Add a reminder time on each card. While the tab is open, the app schedules the nearest reminder and fires a browser Notification with the card title at the specified time. Includes UI to set/clear reminders, storage in the card model, and a future-friendly design (service/manager/scheduler) with PWA service worker stubs disabled by default.

## UX/Behavior

- **Set reminder**: In the card details editor, add a `datetime-local` input labeled “Reminder”.
- **Permission**: Ask for notifications permission on first attempt to set a reminder.
- **Persist**: Store reminder timestamp on the card (`reminderAt` ISO string or null).
- **Schedule**: On app load and card changes, schedule the soonest reminder via a single active `setTimeout`.
- **Trigger**: Show Notification titled “Reminder: {card.title}”. On click: focus tab, scroll to the card, and briefly highlight it.
- **Edge cases**: Past time triggers immediately. On reload/visibility return, reschedule. If notifications are blocked, show an in-app toast instead.

## File Map (small, focused files)

- `src/types/Card.ts` – Card type with `reminderAt`.
- `src/services/NotificationService.ts` – Wraps Web Notifications API.
- `src/repositories/ReminderRepository.ts` – Read/write `reminderAt` on cards via injected store.
- `src/schedulers/ReminderScheduler.ts` – One-timer queue for next due reminders.
- `src/managers/ReminderManager.ts` – Orchestrates repo + scheduler + permissions.
- `src/coordinators/ReminderCoordinator.ts` – Wires due events to UI focus/scroll/notify.
- `src/viewmodels/CardReminderViewModel.ts` – UI-facing logic for card editor inputs.
- `src/state/EventBus.ts` (optional if you already have one) – Lightweight pub/sub for card updates.
- `src/schedulers/ClockResync.ts` – Reschedules on visibility/time drift.
- `src/ui/card-editor/reminder.html` – Editor snippet.
- `public/sw-reminders.stub.js` – PWA stub for future background notifications.
- `src/pwa/registerReminderSW.ts` – Disabled-by-default registration helper.

## Data Model

```ts
// src/types/Card.ts
export type ISODateTimeString = string;

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  // ... other fields ...
  reminderAt?: ISODateTimeString | null; // ISO, UTC; null = no reminder
}
```

Migration: default `reminderAt` to `null` when loading persisted cards missing the field.

## Services and Managers

```ts
// src/services/NotificationService.ts
export interface NotificationPayload {
  title: string;
  body?: string;
  tag?: string;
  onClick?: () => void;
}

export class NotificationService {
  async ensurePermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
  }

  canNotify(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }

  notify({ title, body, tag, onClick }: NotificationPayload): void {
    if (!this.canNotify()) return;
    const n = new Notification(title, { body, tag });
    if (onClick) n.addEventListener("click", () => onClick());
  }
}
```
```ts
// src/repositories/ReminderRepository.ts
import { Card, ISODateTimeString } from "../types/Card";

export interface CardStore {
  getCardById(id: string): Card | undefined;
  saveCard(card: Card): void;
  getAllCards(): Card[];
}

export class ReminderRepository {
  constructor(private readonly cardStore: CardStore) {}

  setReminder(cardId: string, whenISO: ISODateTimeString): Card | undefined {
    const card = this.cardStore.getCardById(cardId);
    if (!card) return undefined;
    const updated: Card = { ...card, reminderAt: whenISO };
    this.cardStore.saveCard(updated);
    return updated;
  }

  clearReminder(cardId: string): Card | undefined {
    const card = this.cardStore.getCardById(cardId);
    if (!card) return undefined;
    const updated: Card = { ...card, reminderAt: null };
    this.cardStore.saveCard(updated);
    return updated;
  }

  cardsWithReminders(): Card[] {
    return this.cardStore.getAllCards().filter(c => !!c.reminderAt);
  }
}
```
```ts
// src/schedulers/ReminderScheduler.ts
export type DueHandler = (cardId: string) => void;

export class ReminderScheduler {
  private queue: Array<{ cardId: string; when: number }> = [];
  private timerId: number | null = null;

  constructor(private readonly onDue: DueHandler) {}

  reload(reminders: Array<{ cardId: string; whenISO: string }>) {
    this.clear();
    for (const r of reminders) this.add(r.cardId, new Date(r.whenISO).getTime());
    this.armNext();
  }

  add(cardId: string, whenEpochMs: number) {
    this.queue.push({ cardId, when: whenEpochMs });
    this.queue.sort((a, b) => a.when - b.when);
    this.armNext();
  }

  remove(cardId: string) {
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

  private armNext() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    const next = this.queue[0];
    if (!next) return;
    const delay = Math.max(0, next.when - Date.now());
    this.timerId = window.setTimeout(() => {
      const now = Date.now();
      const due: Array<{ cardId: string; when: number }> = [];
      while (this.queue.length && this.queue[0].when <= now) {
        due.push(this.queue.shift()!);
      }
      for (const d of due) this.onDue(d.cardId);
      this.armNext();
    }, delay);
  }
}
```
```ts
// src/managers/ReminderManager.ts
import { ReminderRepository } from "../repositories/ReminderRepository";
import { ReminderScheduler } from "../schedulers/ReminderScheduler";
import { NotificationService } from "../services/NotificationService";
import { ISODateTimeString } from "../types/Card";

export class ReminderManager {
  constructor(
    private readonly repo: ReminderRepository,
    private readonly scheduler: ReminderScheduler,
    private readonly notifier: NotificationService
  ) {}

  async init() {
    const reminders = this.repo.cardsWithReminders().map(c => ({
      cardId: c.id,
      whenISO: c.reminderAt!
    }));
    this.scheduler.reload(reminders);
  }

  async setReminder(cardId: string, whenISO: ISODateTimeString) {
    const permission = await this.notifier.ensurePermission();
    this.repo.setReminder(cardId, whenISO);
    this.scheduler.remove(cardId);
    this.scheduler.add(cardId, new Date(whenISO).getTime());
    if (!permission) {
      // optional: show in-app fallback toast hint
    }
  }

  clearReminder(cardId: string) {
    this.repo.clearReminder(cardId);
    this.scheduler.remove(cardId);
  }
}
```
```ts
// src/coordinators/ReminderCoordinator.ts
import { ReminderManager } from "../managers/ReminderManager";
import { NotificationService } from "../services/NotificationService";
import { Card } from "../types/Card";

export interface CardLocator {
  getTitle(cardId: string): string;
  scrollToCard(cardId: string): void;
  highlight(cardId: string): void;
}

export class ReminderCoordinator {
  constructor(
    private readonly manager: ReminderManager,
    private readonly notifier: NotificationService,
    private readonly locator: CardLocator
  ) {}

  async start() { await this.manager.init(); }

  handleDue = (cardId: string) => {
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
```
```ts
// src/viewmodels/CardReminderViewModel.ts
import { ReminderManager } from "../managers/ReminderManager";
import { Card } from "../types/Card";

export class CardReminderViewModel {
  constructor(
    private readonly manager: ReminderManager,
    private readonly cardId: string
  ) {}

  setFromInput(value: string) {
    if (!value) return this.manager.clearReminder(this.cardId);
    const iso = new Date(value).toISOString();
    this.manager.setReminder(this.cardId, iso);
  }

  inputValueFromCard(card: Card): string {
    return card.reminderAt ? new Date(card.reminderAt).toISOString().slice(0, 16) : "";
  }
}
```
```ts
// src/schedulers/ClockResync.ts
export class ClockResync {
  private lastCheck = Date.now();
  private id: number | null = null;
  constructor(private readonly resync: () => void) {}

  start() {
    this.id = window.setInterval(() => {
      const now = Date.now();
      if (Math.abs(now - this.lastCheck - 60_000) > 5_000) {
        this.resync();
      }
      this.lastCheck = now;
    }, 60_000);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.resync();
    });
  }

  stop() { if (this.id) clearInterval(this.id); }
}
```

## UI Integration

```html
<!-- src/ui/card-editor/reminder.html -->
<label for="reminderAt">Reminder</label>
<input id="reminderAt" type="datetime-local" />
<button id="clearReminderBtn" type="button">Clear</button>
```
```ts
// Example hookup in your card editor init code
import { CardReminderViewModel } from "../../viewmodels/CardReminderViewModel";

export function wireCardReminderUI(card, reminderManager) {
  const vm = new CardReminderViewModel(reminderManager, card.id);
  const input = document.getElementById("reminderAt") as HTMLInputElement;
  const clearBtn = document.getElementById("clearReminderBtn") as HTMLButtonElement;

  input.value = vm.inputValueFromCard(card);
  input.addEventListener("change", () => vm.setFromInput(input.value));
  clearBtn.addEventListener("click", () => { input.value = ""; vm.setFromInput(""); });
}
```

Optional card badge: when rendering a card, if `card.reminderAt` exists and is in the future, show a small bell icon.

## App Wiring

```ts
// Startup (e.g., src/main.ts)
import { NotificationService } from "./services/NotificationService";
import { ReminderRepository } from "./repositories/ReminderRepository";
import { ReminderScheduler } from "./schedulers/ReminderScheduler";
import { ReminderManager } from "./managers/ReminderManager";
import { ReminderCoordinator } from "./coordinators/ReminderCoordinator";
import { ClockResync } from "./schedulers/ClockResync";

// Provide your CardStore implementation here
const cardStore = /* your concrete CardStore */;
const notifier = new NotificationService();

// Coordinator needs to supply card title and scrolling utilities
const locator = {
  getTitle: (id: string) => cardStore.getCardById(id)?.title || "",
  scrollToCard: (id: string) => document.querySelector(`[data-card-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
  highlight: (id: string) => {
    const el = document.querySelector(`[data-card-id="${id}"]`);
    if (!el) return;
    el.classList.add("highlight");
    setTimeout(() => el.classList.remove("highlight"), 2000);
  }
};

// Wire scheduler to coordinator's due handler
const scheduler = new ReminderScheduler((cardId) => coordinator.handleDue(cardId));
const repo = new ReminderRepository(cardStore);
const manager = new ReminderManager(repo, scheduler, notifier);
const coordinator = new ReminderCoordinator(manager, notifier, locator);

coordinator.start();
new ClockResync(() => manager.init()).start();
```

Hook into card mutations (create/update/delete):

```ts
// When a card updates, keep scheduler in sync
function onCardSaved(card) {
  if (card.reminderAt) manager.setReminder(card.id, card.reminderAt);
  else manager.clearReminder(card.id);
}
```

## In-app Fallback (if notifications blocked)

Replace the comment in `ReminderManager.setReminder` with your toast system, e.g., show a banner: “Browser notifications are blocked. The reminder will appear in-app.”

## PWA Stub (future background delivery)

```js
// public/sw-reminders.stub.js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Reminder", {
      body: data.body,
      tag: data.tag
    })
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow("/");
    })
  );
});
```
```ts
// src/pwa/registerReminderSW.ts
export function registerReminderSW(enabled: boolean) {
  if (!enabled || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw-reminders.stub.js").catch(console.error);
}
```

Note: Keep this disabled initially; enable when you add push/scheduling infra.

## Manual Test Checklist

- Set a reminder 1 minute ahead: confirm permission prompt, then a Notification fires, clicking focuses and scrolls to the card.
- Set a past-time reminder: triggers immediately.
- Reload the page: scheduled reminders re-arm and still fire.
- Deny permission: ensure in-app fallback message appears and no errors.
- Change system clock forward/backward: returning to the tab reschedules correctly.

## Notes on OOP/SRP and Size Limits

- Each class above has one responsibility and < 200 lines.
- Files are small and modular; swapping the storage layer or adding PWA later won’t affect UI or scheduler code.
- Avoid multiple `setTimeout`s per reminder by keeping a single armed timer over a sorted queue.

### To-dos

- [ ] Add reminderAt to Card type and load defaults
- [ ] Create NotificationService for Web Notifications API
- [ ] Implement ReminderRepository with CardStore DI
- [ ] Build ReminderScheduler with single next-timer strategy
- [ ] Implement ReminderManager to orchestrate repo/scheduler/permission
- [ ] Wire ReminderCoordinator with locator and notifier
- [ ] Add datetime-local field and clear button to card editor
- [ ] Hook editor events to CardReminderViewModel
- [ ] Sync scheduler on card create/update/delete
- [ ] Scroll and highlight card on notification click
- [ ] Reschedule on visibilitychange and minute-drift
- [ ] Add in-app toast when notifications are blocked
- [ ] Add disabled SW stub and registration helper for future PWA