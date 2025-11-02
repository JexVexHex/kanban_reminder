// ========================================
// ThemeManager - Handles Light/Dark/System Theme
// ========================================
class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'kanban-theme-preference';
        this.THEMES = ['dark', 'light', 'system'];
        this.toggleBtn = null;
        this.currentTheme = this.loadTheme();

        this.init();
    }

    /**
     * Initialize theme on page load
     */
    init() {
        this.toggleBtn = document.getElementById('themeToggle');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Apply the theme
        this.applyTheme(this.currentTheme);

        // Listen for system preference changes
        this.listenToSystemPreference();
    }

    /**
     * Load theme preference from localStorage or detect system preference
     */
    loadTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);

        if (saved && this.THEMES.includes(saved)) {
            return saved;
        }

        // Default to 'system' for new users
        return 'system';
    }

    /**
     * Apply theme to the DOM
     */
    applyTheme(theme) {
        let themeToApply = theme;

        // If system theme, detect actual preference
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeToApply = prefersDark ? 'dark' : 'light';
        }

        // Set data-theme attribute on html element
        if (themeToApply === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Update button icon and aria-label
        this.updateButtonState(theme);
    }

    /**
     * Toggle through themes: dark -> light -> system -> dark
     */
    toggleTheme() {
        const currentIndex = this.THEMES.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.THEMES.length;
        this.currentTheme = this.THEMES[nextIndex];

        // Save preference
        localStorage.setItem(this.STORAGE_KEY, this.currentTheme);

        // Apply new theme
        this.applyTheme(this.currentTheme);
    }

    /**
     * Update button text/icon and accessibility labels
     */
    updateButtonState(theme) {
        if (!this.toggleBtn) return;

        const icons = {
            dark: '🌙',    // Moon icon for dark theme
            light: '☀️',   // Sun icon for light theme
            system: '🖥️'   // Monitor icon for system theme
        };

        const labels = {
            dark: 'Dark Theme (Click for Light)',
            light: 'Light Theme (Click for System)',
            system: 'System Theme (Click for Dark)'
        };

        this.toggleBtn.textContent = icons[theme];
        this.toggleBtn.setAttribute('aria-label', labels[theme]);
        this.toggleBtn.title = labels[theme];
    }

    /**
     * Listen for system preference changes
     */
    listenToSystemPreference() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        darkModeQuery.addEventListener('change', (e) => {
            // Only reapply if we're using system theme
            if (this.currentTheme === 'system') {
                this.applyTheme('system');
            }
        });
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}
