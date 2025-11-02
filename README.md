<!-- # Modern Kanban Board -->

A sleek, modern Kanban board built with vanilla HTML5, CSS3, and JavaScript (ES6+). Features drag-and-drop functionality, glassmorphism design, and full local storage persistence.

## Features

- **Drag & Drop**: Seamlessly move cards between columns and reorder columns with smooth animations
- **Card Management**: Create, edit, and delete task cards with titles and descriptions
- **Column Management**: Add and remove columns to organize your workflow
- **Reminder System**: Set reminders on cards with browser notifications when due
- **Local Storage Persistence**: All changes are automatically saved to your browser's local storage
- **Modern Glassmorphism UI**: Beautiful frosted glass effects with backdrop blur
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects throughout
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard support
- **Empty State**: Helpful guidance when starting fresh

## Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, glassmorphism effects, and responsive grid layouts
- **JavaScript (ES6+)**: Modular class-based architecture with clean separation of concerns

## Project Structure

```
kanban4/
├── index.html                    # Semantic HTML structure with modals and accessibility
├── variables.css                 # CSS custom properties and theme variables
├── layout.css                    # Layout and grid styles
├── components.css                # Component styles (cards, columns, modals, toasts)
├── modals-animations.css        # Modal animations and transitions
├── StorageManager.js            # Local storage operations
├── Card.js                      # Card model with reminder support
├── Column.js                    # Column model and rendering
├── ModalManager.js              # Modal and form handling
├── DragDropManager.js           # Drag-and-drop functionality
├── KanbanBoard.js               # Main application controller
├── KanbanUtils.js               # Utility functions
├── src/
│   ├── services/
│   │   ├── NotificationService.js    # Web Notifications API wrapper
│   │   └── ToastService.js            # In-app notification fallback
│   ├── repositories/
│   │   ├── ReminderRepository.js      # Reminder data operations
│   │   └── CardStoreAdapter.js        # Adapter for card storage
│   ├── schedulers/
│   │   ├── ReminderScheduler.js      # Single-timer reminder queue
│   │   └── ClockResync.js             # Time drift detection and resync
│   ├── managers/
│   │   └── ReminderManager.js        # Reminder orchestration
│   ├── coordinators/
│   │   └── ReminderCoordinator.js    # Reminder event coordination
│   ├── viewmodels/
│   │   └── CardReminderViewModel.js   # UI-facing reminder logic
│   └── pwa/
│       └── registerReminderSW.js      # PWA service worker registration (stub)
├── public/
│   └── sw-reminders.stub.js          # Service worker stub for future PWA
└── README.md                          # Project documentation (this file)
```

## Architecture Overview

### JavaScript Classes

#### Core Classes
- **StorageManager**: Handles all local storage operations with error handling
- **Card**: Represents a task card with title, description, reminder support, and rendering logic
- **Column**: Manages cards within a column and provides rendering
- **ModalManager**: Handles modal operations and form interactions
- **DragDropManager**: Manages drag-and-drop operations
- **KanbanBoard**: Main application controller handling state, events, and user interactions

#### Reminder System Classes
- **NotificationService**: Wraps Web Notifications API for browser notifications
- **ToastService**: Provides in-app toast notifications as fallback
- **ReminderRepository**: Handles reminder data persistence operations
- **CardStoreAdapter**: Adapter bridging KanbanBoard columns to ReminderRepository
- **ReminderScheduler**: Efficient single-timer queue for scheduling reminders
- **ClockResync**: Detects time drift and reschedules reminders accordingly
- **ReminderManager**: Orchestrates reminder operations (set, clear, permissions)
- **ReminderCoordinator**: Coordinates reminder events and UI interactions
- **CardReminderViewModel**: UI-facing logic for card reminder inputs

### Design System

- **CSS Custom Properties**: Centralized theme variables for easy customization
- **Glassmorphism**: Backdrop blur effects with semi-transparent overlays
- **Responsive Grid**: Auto-fill grid that adapts to screen size
- **Accessibility**: ARIA labels, semantic HTML, and keyboard navigation support

## How to Use

1. **Open the Application**: Simply double-click `index.html` or open it in your web browser

### Basic Operations

- **Add a Column**: Click the "+ Add Column" button in the header
- **Add a Card**: Click "+ Add a card" at the bottom of any column
- **Edit a Card**: Click the pencil icon (✏️) on any card
- **Delete a Card**: Click the trash icon (🗑️) on any card
- **Delete a Column**: Click the ellipsis icon (⋮) in the column header
- **Drag Cards**: Click and hold a card to move it between columns
- **Reorder Columns**: Click and hold a column header to reorder columns

### Reminder Feature

- **Set a Reminder**: When creating or editing a card, use the "Reminder" datetime picker to set when you want to be notified
- **Clear a Reminder**: Click the "Clear" button next to the reminder input to remove an existing reminder
- **Notifications**: When a reminder time arrives, you'll receive a browser notification (if permissions are granted)
- **Visual Indicator**: Cards with active reminders display a bell icon (🔔) next to the title
- **Notification Click**: Clicking a reminder notification will focus the browser tab, scroll to the card, and highlight it
- **Permission Handling**: The app will request notification permissions when you first set a reminder
- **In-App Fallback**: If browser notifications are blocked, you'll see toast notifications instead

### Data Persistence

All your work is automatically saved to your browser's local storage. Your board will be exactly as you left it when you return, even after closing and reopening the browser.

## Design Features

### Modern UI Elements

- Glassmorphism effects with blur and transparency
- Gradient text for headers
- Smooth hover and focus states
- Custom scrollbar styling
- Responsive typography

### Color Palette

- **Primary**: Indigo gradient (#6366f1 - #4f46e5)
- **Secondary**: Purple (#8b5cf6)
- **Danger**: Red (#ef4444)
- **Background**: Dark slate with gradient
- **Text**: Light slate on dark backgrounds

### Animations

- Smooth 250ms transitions on interactive elements
- Slide-up animation for modals
- Fade-in animation for overlays
- Column entrance animation
- Card hover lift effect

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Installation

No installation required! Just download the files and open `index.html` in your browser.

## Tips for Best Experience

- Use on a desktop or tablet for the best drag-and-drop experience
- Chrome, Firefox, and Safari all work perfectly
- Your data is stored locally - clear browser storage to reset the board
- Try creating multiple columns with different workflow stages
- Grant notification permissions when prompted to enable reminder notifications
- Reminders work best when the browser tab is open (future PWA support planned for background notifications)
- Cards with reminders show a bell icon (🔔) - hover over it to see the reminder time

## Future Enhancement Ideas

- Dark/light theme toggle
- Drag-and-drop reordering of cards within columns
- Card priorities and labels
- PWA support for background reminder notifications (service worker stub included)
- Export/import board data
- Undo/redo functionality
- Search and filter cards
- Recurring reminders
