# Modern Kanban Board

A sleek, modern Kanban board built with vanilla HTML5, CSS3, and JavaScript (ES6+). Features drag-and-drop functionality, glassmorphism design, and full local storage persistence.

## Features

- **Drag & Drop**: Seamlessly move cards between columns and reorder columns with smooth animations
- **Card Management**: Create, edit, and delete task cards with titles and descriptions
- **Column Management**: Add and remove columns to organize your workflow
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
├── index.html       # Semantic HTML structure with modals and accessibility
├── styles.css       # Modern CSS with glassmorphism, animations, and responsive design
├── script.js        # Modular JavaScript with KanbanBoard, Column, Card, and StorageManager classes
└── README.md        # Project documentation (this file)
```

## Architecture Overview

### JavaScript Classes

- **StorageManager**: Handles all local storage operations with error handling
- **Card**: Represents a task card with title, description, and rendering logic
- **Column**: Manages cards within a column and provides rendering
- **KanbanBoard**: Main application controller handling state, events, and user interactions

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

## Future Enhancement Ideas

- Dark/light theme toggle
- Drag-and-drop reordering of cards within columns
- Card priorities and labels
- Due dates and reminders
- Export/import board data
- Undo/redo functionality
- Search and filter cards
