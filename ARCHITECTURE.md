# Modern Kanban Board - Architecture Documentation

## Project Overview

A modern, modular Kanban board built with vanilla HTML5, CSS3, and JavaScript (ES6+), featuring drag-and-drop functionality, glassmorphism design, and full local storage persistence.

## File Structure

### HTML (1 file)
- `index.html` (136 lines) - Main HTML structure with semantic markup, accessibility attributes, and modal templates

### JavaScript (7 files - modular architecture)

#### Core Classes
1. **StorageManager.js** (34 lines)
   - Responsibility: Handle all local storage operations
   - Methods: `save()`, `load()`, `clear()`
   - Error handling with try-catch blocks

2. **Card.js** (67 lines)
   - Responsibility: Represent individual task cards
   - Methods: `render()`, `toJSON()`, `fromJSON()`
   - Includes card UI rendering with edit/delete actions

3. **Column.js** (91 lines)
   - Responsibility: Manage columns and their associated cards
   - Methods: `addCard()`, `removeCard()`, `getCard()`, `render()`, `toJSON()`, `fromJSON()`
   - Handles column rendering with card count display

4. **ModalManager.js** (134 lines)
   - Responsibility: Handle all modal operations and form interactions
   - Methods: `openCardModal()`, `openColumnModal()`, `openDeleteConfirmation()`
   - Event handling for form submissions and modal lifecycle
   - Uses callback functions for decoupled communication

5. **DragDropManager.js** (89 lines)
   - Responsibility: Manage all drag-and-drop operations
   - Methods: `handleDragStart()`, `handleDragEnd()`, `handleDragOver()`, `handleDrop()`, `handleDragLeave()`
   - Uses callbacks for card movement and column swapping

6. **KanbanBoard.js** (184 lines)
   - Responsibility: Main application controller and orchestrator
   - Methods: `init()`, `load()`, `save()`, `render()`, `attachEventListeners()`
   - Manages state and coordinates between all managers
   - Handles business logic for card/column operations

7. **KanbanUtils.js** (15 lines)
   - Responsibility: Shared utility functions
   - Methods: `generateId()`
   - Application initialization trigger

### CSS (4 files - modular styles)

1. **variables.css** (49 lines)
   - CSS custom properties for theming
   - Color schemes, shadows, spacing, animations, border radius

2. **layout.css** (184 lines)
   - Global reset and layout styles
   - Header, main content, kanban container, columns, empty state
   - Responsive grid system

3. **components.css** (263 lines)
   - UI component styles: cards, buttons, forms
   - Column actions, card actions, scrollbars
   - Hover states and transitions

4. **modals-animations.css** (169 lines)
   - Modal dialog styles
   - Animation keyframes (fadeIn, slideUp, slideInLeft)
   - Responsive design breakpoints
   - Accessibility support (prefers-reduced-motion)

## Architecture Patterns

### Object-Oriented Design
- Each major concern encapsulated in dedicated classes
- Single responsibility principle throughout
- Clear method naming following domain language

### Dependency Injection via Callbacks
- ModalManager and DragDropManager use callback functions
- Allows KanbanBoard to coordinate without tight coupling
- Example: `dragDropManager.onCardMoveCallback = (cardId, fromId, toId) => ...`

### Event Delegation
- KanbanBoard uses event listeners on container elements
- Reduces listener count and improves performance
- Handles dynamic content (added/removed cards)

### Model-View Separation
- Card and Column classes handle both data and rendering
- KanbanBoard coordinates state and view updates
- StorageManager handles persistence

### Three-Tier CSS Organization
1. **Variables**: Centralized theme system
2. **Layout**: Structure and positioning
3. **Components**: Interactive elements and animations

## Data Flow

```
User Interaction (Click/Drag)
         ↓
    Event Listener
         ↓
   KanbanBoard.handle*
         ↓
   Modify this.columns
         ↓
   StorageManager.save()
         ↓
   KanbanBoard.render()
         ↓
   Column.render() & Card.render()
```

## Class Responsibilities

### StorageManager
- Abstraction layer for browser storage
- Error handling and data serialization
- No knowledge of Card/Column classes

### Card
- Represents immutable data structure
- Renders itself as DOM element
- Methods for JSON serialization

### Column
- Contains array of Card instances
- Manages card operations (add, remove, get)
- Renders cards and add button

### ModalManager
- Manages all modal UI state
- Form submission handling
- Stores temporary edit context
- No knowledge of business logic

### DragDropManager
- Pure drag-drop handling
- Updates visual feedback only
- Delegates business logic to parent via callbacks

### KanbanBoard
- Orchestrates all managers
- Owns application state (this.columns)
- Handles business logic
- Coordinates save/render cycles

## Key Features Implemented

1. **Drag & Drop**
   - Cards between columns
   - Columns on board
   - Visual feedback during drag

2. **CRUD Operations**
   - Create: Cards and columns via modal forms
   - Read: Display in UI, load from storage
   - Update: Edit card title/description
   - Delete: Remove cards and columns with confirmation

3. **Local Storage**
   - Automatic save after each operation
   - Load on application startup
   - Full data serialization/deserialization

4. **Modern UI**
   - Glassmorphism with backdrop blur
   - Smooth animations and transitions
   - Responsive grid layout
   - Custom scrollbars

5. **Accessibility**
   - Semantic HTML elements
   - ARIA labels and roles
   - Focus management in modals
   - Keyboard support via tab/enter
   - Respects prefers-reduced-motion

## File Size Compliance

All files kept under 500 lines per your guidelines:

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| KanbanUtils.js | JS | 15 | Utilities |
| StorageManager.js | JS | 34 | Storage |
| Card.js | JS | 67 | Model |
| DragDropManager.js | JS | 89 | Drag/Drop |
| Column.js | JS | 91 | Model |
| ModalManager.js | JS | 134 | UI Management |
| KanbanBoard.js | JS | 184 | Orchestration |
| variables.css | CSS | 49 | Theme |
| layout.css | CSS | 184 | Layout |
| modals-animations.css | CSS | 169 | Modals |
| components.css | CSS | 263 | Components |
| index.html | HTML | 136 | Markup |

**Total: 1,415 lines** (distributed across 12 modular files)

## Extension Points

The architecture supports easy extensions:

1. **New Modal Types**: Extend ModalManager
2. **New Drag Behaviors**: Extend DragDropManager
3. **New Storage Backends**: Replace StorageManager
4. **Custom Themes**: Update CSS variables
5. **Additional Card Fields**: Extend Card class and Column rendering
6. **Undo/Redo**: Add command pattern to KanbanBoard

## Performance Considerations

- Event delegation reduces memory footprint
- Efficient DOM queries using closest()
- CSS transitions use GPU acceleration
- Custom scrollbar styling optimized for performance
- Modal fade-ins use CSS animations, not JS loops

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch events
