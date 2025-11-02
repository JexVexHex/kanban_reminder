// ========================================
// ModalManager - Handles Modal Operations
// ========================================
class ModalManager {
    constructor() {
        this.cardModal = document.getElementById('cardModal');
        this.cardForm = document.getElementById('cardForm');
        this.cardTitleInput = document.getElementById('cardTitle');
        this.cardDescInput = document.getElementById('cardDescription');
        this.cardReminderInput = document.getElementById('cardReminder');
        this.clearReminderBtn = document.getElementById('clearReminderBtn');

        this.columnModal = document.getElementById('columnModal');
        this.columnForm = document.getElementById('columnForm');
        this.columnTitleInput = document.getElementById('columnTitle');

        this.confirmModal = document.getElementById('confirmModal');
        this.confirmMessage = document.getElementById('confirmMessage');

        this.cardBeingEdited = null;
        this.columnBeingDeleted = null;
        this.cardBeingDeleted = null;

        this.onCardSubmit = null;
        this.onColumnSubmit = null;
        this.onConfirmDelete = null;
        this.onReminderChange = null;
        this.reminderViewModel = null;
        this._pendingReminder = null;
    }

    attachEventListeners() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.close(e.target.closest('.modal')));
        });

        document.querySelectorAll('.modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => this.close(e.target.closest('.modal')));
        });

        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => this.close(e.target.closest('.modal')));
        });

        // Form submissions
        this.cardForm.addEventListener('submit', (e) => this.handleCardSubmit(e));
        this.columnForm.addEventListener('submit', (e) => this.handleColumnSubmit(e));

        // Reminder input
        if (this.cardReminderInput) {
            this.cardReminderInput.addEventListener('change', () => {
                if (this.reminderViewModel) {
                    this.reminderViewModel.setFromInput(this.cardReminderInput.value);
                } else {
                    // For new cards, store the reminder value to apply after creation
                    this._pendingReminder = this.cardReminderInput.value || null;
                }
            });
        }
        if (this.clearReminderBtn) {
            this.clearReminderBtn.addEventListener('click', () => {
                if (this.cardReminderInput) {
                    this.cardReminderInput.value = '';
                }
                if (this.reminderViewModel) {
                    this.reminderViewModel.setFromInput('');
                } else {
                    this._pendingReminder = null;
                }
            });
        }

        // Confirm dialog
        document.querySelector('.confirm-delete').addEventListener('click', () => this.handleConfirm());
        document.querySelector('.confirm-cancel').addEventListener('click', () => this.close(this.confirmModal));
    }

    openCardModal(card = null, columnId = null, mode = 'create') {
        const cardId = card ? card.id : null;
        this.cardBeingEdited = { cardId, columnId, mode };

        if (mode === 'edit' && card) {
            this.cardTitleInput.value = card.title || '';
            this.cardDescInput.value = card.description || '';
            if (this.cardReminderInput && this.reminderViewModel) {
                this.cardReminderInput.value = this.reminderViewModel.inputValueFromCard(card);
            }
            document.getElementById('cardModalTitle').textContent = 'Edit Card';
        } else {
            this.cardTitleInput.value = '';
            this.cardDescInput.value = '';
            if (this.cardReminderInput) {
                this.cardReminderInput.value = '';
            }
            document.getElementById('cardModalTitle').textContent = 'Add Card';
        }

        this.open(this.cardModal);
        this.cardTitleInput.focus();
    }

    openColumnModal() {
        this.columnTitleInput.value = '';
        this.open(this.columnModal);
        this.columnTitleInput.focus();
    }

    openDeleteConfirmation(type, id, secondaryId = null) {
        this.columnBeingDeleted = null;
        this.cardBeingDeleted = null;

        if (type === 'card') {
            this.cardBeingDeleted = { cardId: id, columnId: secondaryId };
            this.confirmMessage.textContent = 'Are you sure you want to delete this card? This action cannot be undone.';
        } else if (type === 'column') {
            this.columnBeingDeleted = id;
            this.confirmMessage.textContent = 'Are you sure you want to delete this column and all its cards? This action cannot be undone.';
        }

        this.open(this.confirmModal);
    }

    handleCardSubmit(e) {
        e.preventDefault();

        const title = this.cardTitleInput.value.trim();
        const description = this.cardDescInput.value.trim();

        if (!title) return;

        if (this.onCardSubmit) {
            this.onCardSubmit(title, description, this.cardBeingEdited);
        }

        this.close(this.cardModal);
    }

    handleColumnSubmit(e) {
        e.preventDefault();

        const title = this.columnTitleInput.value.trim();
        if (!title) return;

        if (this.onColumnSubmit) {
            this.onColumnSubmit(title);
        }

        this.close(this.columnModal);
    }

    handleConfirm() {
        if (this.onConfirmDelete) {
            this.onConfirmDelete(this.cardBeingDeleted, this.columnBeingDeleted);
        }

        this.close(this.confirmModal);
    }

    open(modalEl) {
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
    }

    close(modalEl) {
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
    }
}
