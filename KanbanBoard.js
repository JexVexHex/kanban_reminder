// ========================================
// KanbanBoard - Main Application Controller
// ========================================
class KanbanBoard {
    constructor() {
        this.columns = [];
        this.storage = new StorageManager();
        this.modalManager = new ModalManager();
        this.dragDropManager = new DragDropManager();

        this.containerEl = document.getElementById('kanbanContainer');
        this.emptyStateEl = document.getElementById('emptyState');

        this._listenersAttached = false;

        // Initialize reminder system
        this.initReminderSystem();

        this.init();
    }

    init() {
        this.load();
        this.render();
        this.attachEventListeners();
        // Start reminder coordinator after render
        if (this.reminderCoordinator) {
            this.reminderCoordinator.start();
        }
    }

    initReminderSystem() {
        // Initialize reminder services
        const notifier = new NotificationService();
        const toastService = new ToastService();
        const cardStore = new CardStoreAdapter(this);
        const repo = new ReminderRepository(cardStore);
        const scheduler = new ReminderScheduler((cardId) => {
            if (this.reminderCoordinator) {
                this.reminderCoordinator.handleDue(cardId);
            }
        });
        const manager = new ReminderManager(repo, scheduler, notifier, toastService);

        // Card locator for scrolling/highlighting
        const locator = {
            getTitle: (id) => {
                const card = cardStore.getCardById(id);
                return card ? card.title : "";
            },
            scrollToCard: (id) => {
                const el = document.querySelector(`[data-card-id="${id}"]`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            },
            highlight: (id) => {
                const el = document.querySelector(`[data-card-id="${id}"]`);
                if (!el) return;
                el.classList.add("card-highlight");
                setTimeout(() => {
                    el.classList.remove("card-highlight");
                }, 2000);
            }
        };

        this.reminderCoordinator = new ReminderCoordinator(manager, notifier, locator);
        this.reminderManager = manager;

        // Clock resync for time drift
        this.clockResync = new ClockResync(() => {
            manager.init();
        });
        this.clockResync.start();

        // PWA stub (disabled by default)
        // registerReminderSW(false);
    }

    load() {
        const data = this.storage.load();
        if (data && data.columns) {
            this.columns = data.columns.map(Column.fromJSON);
        }
    }

    save() {
        const data = {
            columns: this.columns.map(column => column.toJSON())
        };
        this.storage.save(data);
    }

    render() {
        this.containerEl.innerHTML = '';

        if (this.columns.length === 0) {
            this.emptyStateEl.classList.add('active');
        } else {
            this.emptyStateEl.classList.remove('active');
            this.columns.forEach(column => {
                this.containerEl.appendChild(column.render());
            });
        }
    }

    attachEventListeners() {
        if (this._listenersAttached) return;
        this._listenersAttached = true;

        // Header buttons
        document.getElementById('addColumnBtn').addEventListener('click', () => {
            this.modalManager.openColumnModal();
        });
        document.getElementById('addColumnBtnEmpty').addEventListener('click', () => {
            this.modalManager.openColumnModal();
        });

        // Modal manager setup (attach only once)
        this.modalManager.attachEventListeners();
        this.modalManager.onCardSubmit = (title, desc, data) => this.handleCardSubmit(title, desc, data);
        this.modalManager.onColumnSubmit = (title) => this.handleColumnSubmit(title);
        this.modalManager.onConfirmDelete = (card, column) => this.handleConfirmDelete(card, column);

        // Drag and drop manager setup (attach only once on container)
        this.dragDropManager.attachEventListeners(this.containerEl);
        this.dragDropManager.onCardMove = (cardId, fromId, toId, targetIndex) => this.moveCardToColumn(cardId, fromId, toId, targetIndex);
        this.dragDropManager.onColumnSwap = (col1, col2) => this.swapColumns(col1, col2);

        // Container event delegation
        this.containerEl.addEventListener('click', (e) => this.handleContainerClick(e));
        this.emptyStateEl.addEventListener('click', (e) => this.handleContainerClick(e));
    }

    handleContainerClick(e) {
        const cardBtn = e.target.closest('.card-btn');
        const addCardBtn = e.target.closest('.add-card-btn');
        const columnBtn = e.target.closest('.column-btn');

        if (cardBtn) {
            const action = cardBtn.dataset.action;
            const cardEl = cardBtn.closest('.card');
            const cardId = cardEl.dataset.cardId;
            const columnId = cardEl.closest('.column').dataset.columnId;

            if (action === 'edit') {
                const column = this.columns.find(col => col.id === columnId);
                const card = column.getCard(cardId);
                // Setup reminder viewmodel for this card
                if (this.reminderManager && card) {
                    this.modalManager.reminderViewModel = new CardReminderViewModel(this.reminderManager, card.id);
                }
                this.modalManager.openCardModal(card, columnId, 'edit');
            } else if (action === 'delete') {
                this.modalManager.openDeleteConfirmation('card', cardId, columnId);
            }
        }

        if (addCardBtn) {
            const columnEl = addCardBtn.closest('.column');
            const columnId = columnEl.dataset.columnId;
            // Don't set up viewmodel for new cards - we'll handle reminder after card creation
            this.modalManager.reminderViewModel = null;
            this.modalManager._pendingReminder = null;
            this.modalManager.openCardModal(null, columnId, 'create');
        }

        if (columnBtn) {
            const action = columnBtn.dataset.action;
            const columnEl = columnBtn.closest('.column');
            const columnId = columnEl.dataset.columnId;

            if (action === 'delete') {
                this.modalManager.openDeleteConfirmation('column', columnId);
            }
        }
    }

    handleCardSubmit(title, description, cardData) {
        const { cardId, columnId, mode } = cardData;
        const column = this.columns.find(col => col.id === columnId);

        if (mode === 'create') {
            const newCard = new Card(KanbanUtils.generateId(), title, description);
            column.addCard(newCard);
            // Apply pending reminder if set
            if (this.modalManager._pendingReminder) {
                const iso = new Date(this.modalManager._pendingReminder).toISOString();
                newCard.reminderAt = iso;
                if (this.reminderManager) {
                    this.reminderManager.setReminder(newCard.id, iso);
                }
                this.modalManager._pendingReminder = null;
            }
        } else if (mode === 'edit' && cardId) {
            const card = column.getCard(cardId);
            if (card) {
                card.title = title;
                card.description = description;
                // Reminder is already updated by viewmodel, but ensure scheduler sync
                if (this.reminderManager) {
                    if (card.reminderAt) {
                        this.reminderManager.setReminder(card.id, card.reminderAt);
                    } else {
                        this.reminderManager.clearReminder(card.id);
                    }
                }
            }
        }

        this.save();
        this.render();
    }

    handleColumnSubmit(title) {
        const newColumn = new Column(KanbanUtils.generateId(), title);
        this.columns.push(newColumn);

        this.save();
        this.render();
    }

    handleConfirmDelete(cardData, columnId) {
        if (cardData) {
            const { cardId, columnId: colId } = cardData;
            const column = this.columns.find(col => col.id === colId);
            if (column) {
                // Clear reminder if exists
                if (this.reminderManager) {
                    this.reminderManager.clearReminder(cardId);
                }
                column.removeCard(cardId);
                this.save();
                this.render();
            }
        } else if (columnId) {
            // Clear reminders for all cards in the column
            const column = this.columns.find(col => col.id === columnId);
            if (column && this.reminderManager) {
                column.cards.forEach(card => {
                    this.reminderManager.clearReminder(card.id);
                });
            }
            this.columns = this.columns.filter(col => col.id !== columnId);
            this.save();
            this.render();
        }
    }

    moveCardToColumn(cardId, fromColumnId, toColumnId, targetIndex) {
        const fromColumn = this.columns.find(col => col.id === fromColumnId);
        const toColumn = this.columns.find(col => col.id === toColumnId);

        if (fromColumn && toColumn) {
            const card = fromColumn.getCard(cardId);
            if (card) {
                if (fromColumnId === toColumnId) {
                    // Same column - reorder within column
                    toColumn.moveCard(cardId, targetIndex);
                } else {
                    // Different columns - move card
                    fromColumn.removeCard(cardId);
                    if (targetIndex !== undefined) {
                        toColumn.insertCardAt(card, targetIndex);
                    } else {
                        toColumn.addCard(card);
                    }
                }
                // Reminder persists with card, no need to resync
                this.save();
                this.render();
            }
        }
    }

    swapColumns(columnId1, columnId2) {
        const index1 = this.columns.findIndex(col => col.id === columnId1);
        const index2 = this.columns.findIndex(col => col.id === columnId2);

        if (index1 !== -1 && index2 !== -1) {
            [this.columns[index1], this.columns[index2]] = [this.columns[index2], this.columns[index1]];
            this.save();
            this.render();
        }
    }
}
